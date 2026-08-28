// ============================================================================
//  Camada de acesso ao Firebase: Autenticação + Firestore
//  (SDK carregado sob demanda via dynamic import).
// ============================================================================
import { firebaseConfig, isConfigured } from "./firebase-config.js";

const SDK = "https://www.gstatic.com/firebasejs/10.12.2";
let app = null, db = null, auth = null;
let fs = null, au = null;
let iniciando = null;

async function init() {
  if (db) return;
  if (!isConfigured()) throw new Error("Firebase não configurado.");
  if (!iniciando) {
    iniciando = (async () => {
      const { initializeApp } = await import(`${SDK}/firebase-app.js`);
      fs = await import(`${SDK}/firebase-firestore.js`);
      au = await import(`${SDK}/firebase-auth.js`);
      app = initializeApp(firebaseConfig);
      db = fs.getFirestore(app);
      auth = au.getAuth(app);
    })();
  }
  await iniciando;
}

export const firebaseAtivo = () => isConfigured();

// ---- AUTENTICAÇÃO (admin) --------------------------------------------------

// Observa o estado de login. Chama cb(usuario|null). Retorna quando pronto.
export async function observarAuth(cb) {
  await init();
  au.onAuthStateChanged(auth, cb);
}

export async function entrar(email, senha) {
  await init();
  const cred = await au.signInWithEmailAndPassword(auth, email, senha);
  return cred.user;
}

export async function sair() {
  await init();
  await au.signOut(auth);
}

export function usuarioAtual() {
  return auth ? auth.currentUser : null;
}

// Protege uma página de admin: se não houver login, redireciona para o painel.
// Chama onOk(usuario) quando há um admin logado.
export async function exigirLogin(onOk, loginUrl = "index.html") {
  await init();
  au.onAuthStateChanged(auth, (user) => {
    if (user) onOk(user);
    else location.href = loginUrl;
  });
}

// ---- CONFIGURAÇÃO (dados da empresa + valores padrão) ----------------------
const CFG_DOC = ["config", "contrato"];

export async function obterConfig() {
  await init();
  const snap = await fs.getDoc(fs.doc(db, ...CFG_DOC));
  return snap.exists() ? snap.data() : null;
}

export async function salvarConfig(dados) {
  await init();
  await fs.setDoc(fs.doc(db, ...CFG_DOC), { ...dados, atualizadoEm: fs.serverTimestamp() }, { merge: true });
}

// ---- CONTRATOS -------------------------------------------------------------
const COL = "contratos";

export function novoId() {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 20; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// Criação PÚBLICA pelo cliente (só identificação; valores vêm do config).
export async function criarContrato(dados) {
  await init();
  const id = novoId();
  await fs.setDoc(fs.doc(db, COL, id), {
    ...dados,
    id,
    status: "pendente",
    createdAt: fs.serverTimestamp()
  });
  return id;
}

// Leitura/edição — apenas admin (garantido pelas regras do Firestore).
export async function listarContratos() {
  await init();
  const q = fs.query(fs.collection(db, COL), fs.orderBy("createdAt", "desc"));
  const snap = await fs.getDocs(q);
  return snap.docs.map((d) => d.data());
}

export async function buscarContrato(id) {
  await init();
  const snap = await fs.getDoc(fs.doc(db, COL, id));
  return snap.exists() ? snap.data() : null;
}

export async function atualizarContrato(id, campos) {
  await init();
  await fs.updateDoc(fs.doc(db, COL, id), campos);
}

export async function excluirContrato(id) {
  await init();
  await fs.deleteDoc(fs.doc(db, COL, id));
}

// ---- LINKS DE CONTRATO -----------------------------------------------------
//  Cada link é um "convite" com valores próprios (implementação, mensalidade,
//  etc.) para UM cliente específico. Os dados da empresa continuam vindo do
//  config; só os valores mudam por link. Criação/edição: apenas o admin.
const COL_LINKS = "links";

export async function criarLink(dados) {
  await init();
  const id = novoId();
  await fs.setDoc(fs.doc(db, COL_LINKS, id), {
    ...dados,
    id,
    createdAt: fs.serverTimestamp()
  });
  return id;
}

export async function listarLinks() {
  await init();
  const q = fs.query(fs.collection(db, COL_LINKS), fs.orderBy("createdAt", "desc"));
  const snap = await fs.getDocs(q);
  return snap.docs.map((d) => d.data());
}

export async function buscarLink(id) {
  await init();
  const snap = await fs.getDoc(fs.doc(db, COL_LINKS, id));
  return snap.exists() ? snap.data() : null;
}

export async function excluirLink(id) {
  await init();
  await fs.deleteDoc(fs.doc(db, COL_LINKS, id));
}
