// ============================================================================
//  Tela "Contratos" — listagem
// ============================================================================
import { listarContratos, firebaseAtivo } from "./db.js";
import { ADMIN_SENHA } from "./firebase-config.js";
import { nomeCliente, docCliente } from "./contract-template.js";
import { formatarMoeda } from "./utils.js";

const CHAVE = "victorino_admin_ok";
const loginBg = document.getElementById("login-bg");
const app = document.getElementById("app");

function abrir() { loginBg.classList.remove("show"); app.style.display = "block"; carregar(); }
if (sessionStorage.getItem(CHAVE) === "1") abrir();

document.getElementById("btn-login").addEventListener("click", login);
document.getElementById("senha-input").addEventListener("keydown", (e) => { if (e.key === "Enter") login(); });
function login() {
  if (document.getElementById("senha-input").value === ADMIN_SENHA) {
    sessionStorage.setItem(CHAVE, "1"); abrir();
  } else document.getElementById("login-erro").style.display = "block";
}

async function carregar() {
  const alvo = document.getElementById("lista");
  if (!firebaseAtivo()) {
    alvo.innerHTML = `<div class="banner warn"><span>⚠️</span><span>
      <strong>Firebase não configurado.</strong> Configure <code>js/firebase-config.js</code> para listar os contratos salvos.</span></div>`;
    return;
  }
  let itens = [];
  try {
    itens = await listarContratos();
  } catch (e) {
    console.error(e);
    alvo.innerHTML = `<div class="banner warn"><span>⚠️</span><span>Erro ao carregar: ${e.message}</span></div>`;
    return;
  }
  if (!itens.length) {
    alvo.innerHTML = `<div class="banner info"><span>ℹ️</span><span>Nenhum contrato gerado ainda.
      <a href="index.html">Criar o primeiro</a>.</span></div>`;
    return;
  }

  const base = `${location.origin}${location.pathname.replace(/contratos\.html$/, "")}`;
  const linhas = itens.map((c) => {
    const link = `${base}contrato.html?id=${c.id}`;
    const data = c.dataAssinatura ? c.dataAssinatura.split("-").reverse().join("/") : "—";
    const tag = c.status === "assinado"
      ? `<span class="tag assinado">Assinado</span>`
      : `<span class="tag pendente">Pendente</span>`;
    return `<tr>
      <td><strong>${nomeCliente(c)}</strong><br><small style="color:var(--cinza)">${c.tipoCliente} · ${docCliente(c)}</small></td>
      <td>R$ ${formatarMoeda(c.valorMensalidade)}/mês</td>
      <td>${data}</td>
      <td>${tag}</td>
      <td>
        <a href="${link}" target="_blank" class="btn btn-outline" style="padding:7px 12px;font-size:13px">Abrir</a>
        <button class="btn btn-ghost btn-copy" data-link="${link}" style="padding:7px 12px;font-size:13px">Copiar link</button>
      </td>
    </tr>`;
  }).join("");

  alvo.innerHTML = `<table class="lista">
    <thead><tr><th>Cliente</th><th>Mensalidade</th><th>Data</th><th>Status</th><th>Ações</th></tr></thead>
    <tbody>${linhas}</tbody></table>`;

  alvo.querySelectorAll(".btn-copy").forEach((b) =>
    b.addEventListener("click", () => {
      navigator.clipboard?.writeText(b.dataset.link);
      const t = b.textContent; b.textContent = "Copiado!";
      setTimeout(() => (b.textContent = t), 1400);
    }));
}
