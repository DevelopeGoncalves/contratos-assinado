// ============================================================================
//  cliente.html — formulário PÚBLICO (sem senha). O cliente preenche só a
//  identificação; os valores vêm do config (somente leitura) e são gravados
//  junto ao contrato para o admin conferir e gerar o PDF.
// ============================================================================
import { obterConfig, criarContrato, firebaseAtivo } from "./db.js";
import { gerarContratoHTML, CAMPOS_VALORES } from "./contract-template.js";
import { mascaraCNPJ, mascaraCPF, mascaraCEP, formatarMoeda } from "./utils.js";

const $ = (id) => document.getElementById(id);
let CFG = null;

if (!firebaseAtivo()) {
  $("carregando").innerHTML = "⚠️ Sistema indisponível no momento.";
} else {
  iniciar();
}

async function iniciar() {
  try {
    CFG = await obterConfig();
  } catch (e) {
    console.error(e);
    return erroFatal("Não foi possível carregar o sistema. Tente novamente mais tarde.");
  }
  if (!CFG) return erroFatal("O contrato ainda está sendo configurado pela empresa. Tente novamente mais tarde.");

  $("carregando").style.display = "none";
  $("app").style.display = "block";

  renderValoresLeitura();
  configurarForm();
}

function erroFatal(msg) {
  $("carregando").innerHTML = `<div class="banner warn" style="max-width:520px;margin:30px auto"><span>⚠️</span><span>${msg}</span></div>`;
}

function renderValoresLeitura() {
  $("valores-leitura").innerHTML = `
    <div class="ro-item"><span>Objeto</span><strong>${CFG.objeto || "—"}</strong></div>
    <div class="ro-item"><span>Taxa de implementação (Setup)</span><strong>R$ ${formatarMoeda(CFG.valorSetup)}</strong></div>
    <div class="ro-item"><span>Mensalidade</span><strong>R$ ${formatarMoeda(CFG.valorMensalidade)}</strong></div>
    <div class="ro-item"><span>Dia de vencimento</span><strong>${String(CFG.diaVencimento).padStart(2, "0")}</strong></div>
    <div class="ro-item"><span>Carência (fidelidade)</span><strong>${CFG.fidelidadeMeses} meses</strong></div>
    <div class="ro-item"><span>Reajuste anual</span><strong>+${CFG.reajustePercent}% a cada 12 meses</strong></div>`;
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
  // Anexa os VALORES exatamente como estão no config (o cliente não os altera).
  CAMPOS_VALORES.forEach((k) => (dados[k] = CFG[k]));

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
