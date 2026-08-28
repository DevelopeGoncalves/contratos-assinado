// ============================================================================
//  links.html — o admin gera um link de contrato por cliente, com valores
//  próprios (implementação, mensalidade, etc.). Os dados da empresa e as
//  cláusulas continuam vindo do config/template; aqui só mudam os valores.
// ============================================================================
import { exigirLogin, sair, obterConfig, criarLink, listarLinks, excluirLink } from "./db.js?v=4";
import { CONFIG_PADRAO } from "./contract-template.js?v=3";
import { formatarMoeda } from "./utils.js";

const $ = (id) => document.getElementById(id);
let CFG = null;

$("btn-sair").addEventListener("click", async (e) => {
  e.preventDefault(); await sair(); location.href = "index.html";
});

exigirLogin(async () => {
  try {
    CFG = await obterConfig();
  } catch (e) {
    console.error(e);
  }
  $("carregando").style.display = "none";
  $("app").style.display = "block";

  preencherPadroes(CFG || CONFIG_PADRAO);
  if (!CFG) mostrarMsg("Dica: salve as Configurações primeiro para os padrões virem preenchidos.", "warn");

  $("form-link").addEventListener("submit", gerar);
  await carregarLista();
});

// Base do link do cliente (mesma pasta do site).
function baseUrl() {
  return `${location.origin}${location.pathname.replace(/links\.html$/, "")}`;
}
function urlDoLink(id) {
  return `${baseUrl()}cliente.html?link=${id}`;
}

function preencherPadroes(cfg) {
  const f = $("form-link").elements;
  const set = (n, v) => { if (f[n] != null && v != null) f[n].value = v; };
  set("objeto", cfg.objeto);
  set("valorSetup", cfg.valorSetup);
  set("valorMensalidade", cfg.valorMensalidade);
  set("diaVencimento", cfg.diaVencimento);
  set("cidadeAssinatura", cfg.cidadeAssinatura);
  set("ufAssinatura", cfg.ufAssinatura);
  set("fidelidadeMeses", cfg.fidelidadeMeses);
  set("reajustePercent", cfg.reajustePercent);
}

async function gerar(e) {
  e.preventDefault();
  const f = e.target.elements;
  const g = (n) => f[n].value.trim();
  const dados = {
    clienteNome: g("clienteNome"),
    objeto: g("objeto") || (CFG?.objeto ?? CONFIG_PADRAO.objeto),
    valorSetup: Number(g("valorSetup")) || 0,
    valorMensalidade: Number(g("valorMensalidade")) || 0,
    diaVencimento: g("diaVencimento") || "5",
    cidadeAssinatura: g("cidadeAssinatura") || (CFG?.cidadeAssinatura ?? CONFIG_PADRAO.cidadeAssinatura),
    ufAssinatura: (g("ufAssinatura") || (CFG?.ufAssinatura ?? CONFIG_PADRAO.ufAssinatura)).toUpperCase(),
    fidelidadeMeses: Number(g("fidelidadeMeses")) || 12,
    reajustePercent: Number(g("reajustePercent")) || 50
  };

  const btn = e.submitter;
  btn.disabled = true; btn.textContent = "Gerando...";
  try {
    const id = await criarLink(dados);
    mostrarNovoLink(id);
    e.target.reset();
    preencherPadroes(CFG || CONFIG_PADRAO);
    await carregarLista();
  } catch (err) {
    console.error(err);
    mostrarMsg("Erro ao gerar o link: " + err.message + " (verifique as regras do Firestore)", "warn");
  } finally {
    btn.disabled = false; btn.textContent = "🔗 Gerar link do cliente";
  }
}

function mostrarNovoLink(id) {
  const url = urlDoLink(id);
  $("novo-link-url").value = url;
  $("btn-abrir-novo").href = url;
  $("novo-link").style.display = "block";
  const copiar = $("btn-copiar-novo");
  copiar.onclick = () => {
    navigator.clipboard?.writeText(url);
    copiar.textContent = "Copiado!";
    setTimeout(() => (copiar.textContent = "Copiar"), 1500);
  };
  $("novo-link").scrollIntoView({ behavior: "smooth" });
}

async function carregarLista() {
  const alvo = $("lista-links");
  let itens = [];
  try {
    itens = await listarLinks();
  } catch (e) {
    console.error(e);
    alvo.innerHTML = `<div class="banner warn"><span>⚠️</span><span>Erro ao carregar: ${e.message}</span></div>`;
    return;
  }
  if (!itens.length) {
    alvo.innerHTML = `<div class="banner info"><span>ℹ️</span><span>Nenhum link criado ainda. Gere o primeiro no formulário acima.</span></div>`;
    return;
  }

  const linhas = itens.map((l) => {
    const url = urlDoLink(l.id);
    const nome = l.clienteNome ? l.clienteNome : "(sem nome)";
    return `
    <tr>
      <td><strong>${escapar(nome)}</strong><br><small style="color:var(--cinza)">ID: ${l.id}</small></td>
      <td>R$ ${formatarMoeda(l.valorSetup)}</td>
      <td>R$ ${formatarMoeda(l.valorMensalidade)}/mês</td>
      <td>
        <div class="actions" style="margin:0">
          <button class="btn btn-gold" data-copiar="${url}" style="padding:7px 14px;font-size:13px">Copiar link</button>
          <a href="${url}" target="_blank" class="btn btn-outline" style="padding:7px 14px;font-size:13px">Abrir</a>
          <button class="btn btn-outline" data-excluir="${l.id}" style="padding:7px 14px;font-size:13px">Excluir</button>
        </div>
      </td>
    </tr>`;
  }).join("");

  alvo.innerHTML = `<table class="lista">
    <thead><tr><th>Cliente</th><th>Implementação</th><th>Mensalidade</th><th></th></tr></thead>
    <tbody>${linhas}</tbody></table>`;

  alvo.querySelectorAll("[data-copiar]").forEach((b) =>
    b.addEventListener("click", () => {
      navigator.clipboard?.writeText(b.dataset.copiar);
      const t = b.textContent; b.textContent = "Copiado!";
      setTimeout(() => (b.textContent = t), 1500);
    }));

  alvo.querySelectorAll("[data-excluir]").forEach((b) =>
    b.addEventListener("click", async () => {
      if (!confirm("Excluir este link? Quem já abriu não conseguirá mais enviar por ele.")) return;
      try {
        await excluirLink(b.dataset.excluir);
        await carregarLista();
      } catch (err) {
        console.error(err);
        mostrarMsg("Erro ao excluir: " + err.message, "warn");
      }
    }));
}

function escapar(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function mostrarMsg(txt, tipo) {
  const el = $("link-msg");
  el.className = "banner " + (tipo === "ok" ? "ok" : "warn");
  el.textContent = txt;
  el.style.display = "flex";
}
