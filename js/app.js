// ============================================================================
//  index.html — Login (Firebase Auth) + Dashboard do admin
// ============================================================================
import { observarAuth, entrar, sair, obterConfig, firebaseAtivo } from "./db.js";

const $ = (id) => document.getElementById(id);
const carregando = $("carregando");
const telaLogin = $("tela-login");
const telaPainel = $("tela-painel");

function mostrar(el) {
  [carregando, telaLogin, telaPainel].forEach((x) => (x.style.display = "none"));
  el.style.display = el === carregando ? "block" : "block";
}

if (!firebaseAtivo()) {
  carregando.innerHTML = "⚠️ Firebase não configurado. Veja o README.";
} else {
  iniciar();
}

async function iniciar() {
  // Login
  $("btn-entrar").addEventListener("click", fazerLogin);
  $("senha").addEventListener("keydown", (e) => { if (e.key === "Enter") fazerLogin(); });
  $("btn-sair").addEventListener("click", async (e) => { e.preventDefault(); await sair(); location.reload(); });

  await observarAuth(async (user) => {
    if (user) {
      $("nav").style.display = "";
      $("email-logado").textContent = user.email;
      montarLinkCliente();
      mostrar(telaPainel);
      verificarConfig();
    } else {
      mostrar(telaLogin);
    }
  });
}

async function fazerLogin() {
  const email = $("email").value.trim();
  const senha = $("senha").value;
  const erro = $("login-erro");
  erro.style.display = "none";
  if (!email || !senha) return falha("Informe e-mail e senha.");
  $("btn-entrar").disabled = true; $("btn-entrar").textContent = "Entrando...";
  try {
    await entrar(email, senha);
    // onAuthStateChanged cuida da troca de tela.
  } catch (e) {
    falha(traduzErroAuth(e));
    $("btn-entrar").disabled = false; $("btn-entrar").textContent = "Entrar";
  }
  function falha(m) { erro.textContent = m; erro.style.display = "flex"; }
}

function montarLinkCliente() {
  const base = `${location.origin}${location.pathname.replace(/index\.html$/, "")}`;
  const url = `${base}cliente.html`;
  $("link-cliente").value = url;
  $("btn-abrir-cliente").href = url;
  $("btn-copiar").addEventListener("click", () => {
    navigator.clipboard?.writeText(url);
    $("btn-copiar").textContent = "Copiado!";
    setTimeout(() => ($("btn-copiar").textContent = "Copiar"), 1500);
  });
}

async function verificarConfig() {
  const cfg = await obterConfig();
  if (!cfg) {
    $("aviso-config").innerHTML = `<div class="banner warn"><span>⚠️</span><span>
      <strong>Primeiro acesso:</strong> abra <a href="configuracoes.html">Configurações</a> e clique em
      <strong>Salvar</strong> para gravar os dados da empresa e os valores no Firebase.
      Enquanto isso, o formulário do cliente fica indisponível.</span></div>`;
  }
}

function traduzErroAuth(e) {
  const c = (e && e.code) || "";
  if (c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found"))
    return "E-mail ou senha incorretos.";
  if (c.includes("invalid-email")) return "E-mail inválido.";
  if (c.includes("too-many-requests")) return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  if (c.includes("operation-not-allowed"))
    return "Login por e-mail/senha não está ativado no Firebase. Ative em Authentication → Sign-in method.";
  if (c.includes("network")) return "Falha de conexão. Verifique sua internet.";
  return "Não foi possível entrar. (" + (c || e.message) + ")";
}
