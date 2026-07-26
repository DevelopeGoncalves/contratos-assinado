// ============================================================================
//  Camada de acesso ao banco (Firestore)
//
//  O SDK do Firebase é carregado sob demanda (dynamic import). Assim o
//  gerador/impressão de contrato funciona mesmo antes de configurar o
//  Firebase e o site não quebra caso a CDN esteja indisponível.
// ============================================================================
import { firebaseConfig, isConfigured } from "./firebase-config.js";

const SDK = "https://www.gstatic.com/firebasejs/10.12.2";
let db = null;
let fs = null;          // funções do firestore
let iniciado = false;

async function garantirDB() {
  if (iniciado) return db;
  iniciado = true;
  if (!isConfigured()) return null;
  try {
    const { initializeApp } = await import(`${SDK}/firebase-app.js`);
    fs = await import(`${SDK}/firebase-firestore.js`);
    const app = initializeApp(firebaseConfig);
    db = fs.getFirestore(app);
  } catch (e) {
    console.error("Falha ao iniciar o Firebase:", e);
    db = null;
  }
  return db;
}

// Indica se o Firebase está configurado (para mensagens da interface).
export const firebaseAtivo = () => isConfigured();

const COL = "contratos";

// Gera um ID curto e legível para o contrato.
export function novoId() {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 20; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function salvarContrato(dados) {
  const d = await garantirDB();
  if (!d) throw new Error("Firebase não configurado.");
  const id = dados.id || novoId();
  await fs.setDoc(fs.doc(d, COL, id), {
    ...dados,
    id,
    status: dados.status || "pendente",
    createdAt: fs.serverTimestamp()
  });
  return id;
}

export async function buscarContrato(id) {
  const d = await garantirDB();
  if (!d) throw new Error("Firebase não configurado.");
  const snap = await fs.getDoc(fs.doc(d, COL, id));
  return snap.exists() ? snap.data() : null;
}

export async function listarContratos() {
  const d = await garantirDB();
  if (!d) throw new Error("Firebase não configurado.");
  const q = fs.query(fs.collection(d, COL), fs.orderBy("createdAt", "desc"));
  const snap = await fs.getDocs(q);
  return snap.docs.map((x) => x.data());
}

export async function assinarContrato(id, assinatura) {
  const d = await garantirDB();
  if (!d) throw new Error("Firebase não configurado.");
  await fs.updateDoc(fs.doc(d, COL, id), { status: "assinado", assinatura });
}
