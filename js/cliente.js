// ============================================================================
//  cliente.html — formulário PÚBLICO (sem senha). O cliente preenche só a
//  identificação; os valores vêm de um LINK específico (?link=ID) quando houver,
//  ou do config padrão (somente leitura), e são gravados junto ao contrato para
//  o admin conferir e gerar o PDF.
// ============================================================================
import { obterConfig, buscarLink, criarContrato, firebaseAtivo } from "./db.js?v=4";
import { gerarContratoHTML, CAMPOS_VALORES } from "./contract-template.js?v=3";
import { mascaraCNPJ, mascaraCPF, mascaraCEP, formatarMoeda } from "./utils.js";

const $ = (id) => document.getElementById(id);
const LINK_ID = new URLSearchParams(location.search).get("link") || "";
let CFG = null;   // dados da empresa (CONTRATADA) — sempre do config
let VAL = null;   // fonte dos valores: o LINK do cliente, ou o config padrão
let LINK = null;  // documento do link (quando o cliente abre um link específico)

if (!firebaseAtivo()) {
  $("carregando").innerHTML = "⚠️ Sistema indisponível no momento.";
} else {
  iniciar();
}

async function iniciar() {
  try {
    CFG = await obterConfig();
    if (LINK_ID) LINK = await buscarLink(LINK_ID);
  } catch (e) {
    console.error(e);
    return erroFatal("Não foi possível carregar o sistema. Tente novamente mais tarde.");
  }
  if (!CFG) return erroFatal("O contrato ainda está sendo configurado pela empresa. Tente novamente mais tarde.");
  if (LINK_ID && !LINK) return erroFatal("Este link de contrato não é válido ou foi removido. Solicite um novo link à empresa.");

  // Os VALORES vêm do link (se houver); os dados da empresa vêm sempre do config.
  VAL = LINK || CFG;

  $("carregando").style.display = "none";
  $("app").style.display = "block";

  renderValoresLeitura();
  configurarForm();
}

function erroFatal(msg) {
  $("carregando").innerHTML = `<div class="banner warn" style="max-width:520px;margin:30px auto"><span>⚠️</span><span>${msg}</span></div>`;
}

function renderValoresLeitura() {
  const v = (k) => VAL[k] ?? CFG[k];
  $("valores-leitura").innerHTML = `
    <div class="ro-item"><span>Objeto</span><strong>${v("objeto") || "—"}</strong></div>
    <div class="ro-item"><span>Taxa de implementação (Setup)</span><strong>R$ ${formatarMoeda(v("valorSetup"))}</strong></div>
    <div class="ro-item"><span>Mensalidade</span><strong>R$ ${formatarMoeda(v("valorMensalidade"))}</strong></div>
    <div class="ro-item"><span>Dia de vencimento</span><strong>${String(v("diaVencimento")).padStart(2, "0")}</strong></div>
    <div class="ro-item"><span>Carência (fidelidade)</span><strong>${v("fidelidadeMeses")} meses</strong></div>
    <div class="ro-item"><span>Reajuste anual</span><strong>+${v("reajustePercent")}% a cada 12 meses</strong></div>`;
}

function configurarForm() {
  const blocoPJ = $("bloco-pj"), blocoPF = $("bloco-pf");
  document.querySelectorAll('[name="tipoCliente"]').forEach((r) =>
    r.addEventListener("change", () => {
      const pj = document.querySelector('[name="tipoCliente"]:checked').value === "PJ";
      blocoPJ.style.display = pj ? "" : "none";
      blocoPF.style.display = pj ? "none" : "";
    }));

  const masks = { cnpj: mascaraCNPJ, cpf: mascaraCPF, cep: mascaraCEP };
  document.querySelectorAll("[data-mask]").forEach((el) => {
    const t = el.dataset.mask;
    if (masks[t]) el.addEventListener("input", () => (el.value = masks[t](el.value)));
  });

  $("form-cliente").addEventListener("submit", enviar);
  $("btn-ver").addEventListener("click", verContrato);
}

function coletar() {
  const f = $("form-cliente");
  const g = (n) => (f.elements[n] ? f.elements[n].value.trim() : "");
  const tipo = f.elements["tipoCliente"].value;

  const dados = {
    tipoCliente: tipo,
    razaoSocial: g("razaoSocial"), cnpj: g("cnpj"),
    repNome: g("repNome"), repRg: g("repRg"), repCpf: g("repCpf"),
    nome: g("nome"), cpf: g("cpf"), rg: g("rg"),
    nacionalidade: g("nacionalidade"), estadoCivil: g("estadoCivil"), profissao: g("profissao"),
    endereco: {
      logradouro: g("logradouro"), numero: g("numero"), complemento: g("complemento"),
      bairro: g("bairro"), cidade: g("cidade"), uf: g("uf").toUpperCase(), cep: g("cep")
    }
  };
  // Anexa os VALORES exatamente como definidos pela empresa (link ou config).
  // O cliente não consegue alterá-los (as regras do Firestore conferem isso).
  CAMPOS_VALORES.forEach((k) => (dados[k] = VAL[k] ?? CFG[k]));
  // Guarda a origem: qual link gerou este contrato (para o admin identificar).
  if (LINK_ID) {
    dados.linkId = LINK_ID;
    if (LINK && LINK.clienteNome) dados.linkNome = LINK.clienteNome;
  }

  const faltando = [];
  if (tipo === "PJ") {
    if (!dados.razaoSocial) faltando.push("Razão social");
    if (!dados.cnpj) faltando.push("CNPJ");
    if (!dados.repNome) faltando.push("Representante legal");
    if (!dados.repCpf) faltando.push("CPF do representante");
  } else {
    if (!dados.nome) faltando.push("Nome completo");
    if (!dados.cpf) faltando.push("CPF");
  }
  if (!dados.endereco.logradouro) faltando.push("Logradouro");
  if (!dados.endereco.cidade) faltando.push("Cidade");
  if (!dados.endereco.uf) faltando.push("UF");
  return { dados, faltando };
}

function verContrato() {
  const { dados } = coletar();
  const box = $("preview");
  box.innerHTML = gerarContratoHTML(dados, CFG);
  box.style.display = "block";
  box.scrollIntoView({ behavior: "smooth" });
}

async function enviar(e) {
  e.preventDefault();
  const { dados, faltando } = coletar();
  if (faltando.length) {
    alert("Preencha os campos obrigatórios:\n\n• " + faltando.join("\n• "));
    return;
  }
  const btn = e.submitter;
  btn.disabled = true; btn.textContent = "Enviando...";
  try {
    await criarContrato(dados);
    $("app").style.display = "none";
    $("tela-ok").style.display = "block";
    window.scrollTo(0, 0);
  } catch (err) {
    console.error(err);
    alert("Não foi possível enviar. Verifique sua conexão e tente novamente.\n\n" + err.message);
    btn.disabled = false; btn.textContent = "✅ Enviar meus dados";
  }
}
