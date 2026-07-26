// ============================================================================
//  contrato.html — visão do admin de um contrato: editar valores + gerar PDF.
// ============================================================================
import { exigirLogin, sair, obterConfig, buscarContrato, atualizarContrato, excluirContrato } from "./db.js";
import { gerarContratoHTML } from "./contract-template.js?v=3";

const $ = (id) => document.getElementById(id);
const id = new URLSearchParams(location.search).get("id");
let CFG = null, DADOS = null;

$("btn-sair").addEventListener("click", async (e) => { e.preventDefault(); await sair(); location.href = "index.html"; });

exigirLogin(async () => {
  if (!id) return fatal("Contrato não especificado.");
  try {
    [CFG, DADOS] = await Promise.all([obterConfig(), buscarContrato(id)]);
  } catch (e) {
    console.error(e);
    return fatal("Erro ao carregar o contrato. " + e.message);
  }
  if (!DADOS) return fatal("Contrato não encontrado.");

  $("carregando").style.display = "none";
  $("app").style.display = "block";

  preencherForm();
  render();

  $("form-valores").addEventListener("submit", salvar);
  $("btn-pdf").addEventListener("click", () => window.print());
  $("btn-excluir").addEventListener("click", remover);
  document.querySelectorAll("#form-valores input").forEach((el) =>
    el.addEventListener("input", () => render(coletar())));
});

function fatal(msg) {
  $("carregando").innerHTML = `<div class="banner warn" style="max-width:560px;margin:30px auto"><span>⚠️</span><span>${msg}</span></div>`;
}

function preencherForm() {
  const f = $("form-valores").elements;
  const set = (n, v) => { if (f[n] != null && v != null) f[n].value = v; };
  set("objeto", DADOS.objeto ?? CFG?.objeto);
  set("valorSetup", DADOS.valorSetup ?? CFG?.valorSetup);
  set("valorMensalidade", DADOS.valorMensalidade ?? CFG?.valorMensalidade);
  set("diaVencimento", DADOS.diaVencimento ?? CFG?.diaVencimento);
  set("dataAssinatura", DADOS.dataAssinatura ?? new Date().toISOString().slice(0, 10));
  set("cidadeAssinatura", DADOS.cidadeAssinatura ?? CFG?.cidadeAssinatura);
  set("ufAssinatura", DADOS.ufAssinatura ?? CFG?.ufAssinatura);
  set("fidelidadeMeses", DADOS.fidelidadeMeses ?? CFG?.fidelidadeMeses ?? 12);
  set("reajustePercent", DADOS.reajustePercent ?? CFG?.reajustePercent ?? 50);
}

function coletar() {
  const f = $("form-valores").elements;
  const g = (n) => f[n].value;
  return {
    ...DADOS,
    objeto: g("objeto"),
    valorSetup: Number(g("valorSetup")) || 0,
    valorMensalidade: Number(g("valorMensalidade")) || 0,
    diaVencimento: g("diaVencimento"),
    dataAssinatura: g("dataAssinatura"),
    cidadeAssinatura: g("cidadeAssinatura"),
    ufAssinatura: (g("ufAssinatura") || "").toUpperCase(),
    fidelidadeMeses: Number(g("fidelidadeMeses")) || 12,
    reajustePercent: Number(g("reajustePercent")) || 50
  };
}

function render(dados) {
  $("doc-alvo").innerHTML = gerarContratoHTML(dados || DADOS, CFG);
}

async function salvar(e) {
  e.preventDefault();
  const novos = coletar();
  const campos = {
    objeto: novos.objeto, valorSetup: novos.valorSetup, valorMensalidade: novos.valorMensalidade,
    diaVencimento: novos.diaVencimento, dataAssinatura: novos.dataAssinatura,
    cidadeAssinatura: novos.cidadeAssinatura, ufAssinatura: novos.ufAssinatura,
    fidelidadeMeses: novos.fidelidadeMeses, reajustePercent: novos.reajustePercent,
    status: "revisado"
  };
  const btn = e.submitter;
  btn.disabled = true; btn.textContent = "Salvando...";
  try {
    await atualizarContrato(id, campos);
    DADOS = { ...DADOS, ...campos };
    render();
    msg("✅ Alterações salvas.", "ok");
  } catch (err) {
    console.error(err);
    msg("Erro ao salvar: " + err.message, "warn");
  } finally {
    btn.disabled = false; btn.textContent = "💾 Salvar alterações";
  }
}

async function remover() {
  if (!confirm("Tem certeza que deseja EXCLUIR este contrato? Esta ação não pode ser desfeita.")) return;
  try {
    await excluirContrato(id);
    location.href = "contratos.html";
  } catch (err) {
    console.error(err);
    msg("Erro ao excluir: " + err.message, "warn");
  }
}

function msg(txt, tipo) {
  const el = $("msg");
  el.className = "banner " + (tipo === "ok" ? "ok" : "warn");
  el.textContent = txt; el.style.display = "flex";
}
