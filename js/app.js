// ============================================================================
//  Lógica da tela "Novo contrato"
// ============================================================================
import { salvarContrato, firebaseAtivo } from "./db.js";
import { ADMIN_SENHA } from "./firebase-config.js";
import { mascaraCNPJ, mascaraCPF, mascaraCEP, mascaraDinheiro } from "./utils.js";

// ---- Login simples ---------------------------------------------------------
const CHAVE = "victorino_admin_ok";
const loginBg = document.getElementById("login-bg");
const app = document.getElementById("app");

function abrirPainel() {
  loginBg.classList.remove("show");
  app.style.display = "block";
  iniciar();
}
if (sessionStorage.getItem(CHAVE) === "1") abrirPainel();

document.getElementById("btn-login").addEventListener("click", tentarLogin);
document.getElementById("senha-input").addEventListener("keydown", (e) => { if (e.key === "Enter") tentarLogin(); });
function tentarLogin() {
  const v = document.getElementById("senha-input").value;
  if (v === ADMIN_SENHA) {
    sessionStorage.setItem(CHAVE, "1");
    abrirPainel();
  } else {
    document.getElementById("login-erro").style.display = "block";
  }
}

// ---- Inicialização do formulário ------------------------------------------
function iniciar() {
  // Banner sobre estado do Firebase
  const banner = document.getElementById("banner-firebase");
  if (!firebaseAtivo()) {
    banner.innerHTML = `<div class="banner warn"><span>⚠️</span><span>
      <strong>Firebase ainda não configurado.</strong> Você pode gerar e imprimir o contrato,
      mas para <strong>salvar e criar o link de assinatura</strong> preencha o arquivo
      <code>js/firebase-config.js</code> (veja o README).</span></div>`;
  }

  // Data padrão = hoje
  const hoje = new Date().toISOString().slice(0, 10);
  document.querySelector('[name="dataAssinatura"]').value = hoje;

  // Alternância PJ / PF
  const blocoPJ = document.getElementById("bloco-pj");
  const blocoPF = document.getElementById("bloco-pf");
  document.querySelectorAll('[name="tipoCliente"]').forEach((r) =>
    r.addEventListener("change", () => {
      const pj = document.querySelector('[name="tipoCliente"]:checked').value === "PJ";
      blocoPJ.style.display = pj ? "" : "none";
      blocoPF.style.display = pj ? "none" : "";
    })
  );

  // Máscaras
  const masks = { cnpj: mascaraCNPJ, cpf: mascaraCPF, cep: mascaraCEP };
  document.querySelectorAll("[data-mask]").forEach((el) => {
    const tipo = el.dataset.mask;
    if (masks[tipo]) el.addEventListener("input", () => { el.value = masks[tipo](el.value); });
  });

  document.getElementById("form-contrato").addEventListener("submit", onSubmit);
  document.getElementById("btn-preview").addEventListener("click", onPreview);
  document.getElementById("btn-copiar").addEventListener("click", copiarLink);
  document.getElementById("btn-fechar").addEventListener("click", () =>
    document.getElementById("modal-link").classList.remove("show"));
}

// ---- Coleta e validação dos dados -----------------------------------------
function coletar() {
  const f = document.getElementById("form-contrato");
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
    },
    objeto: g("objeto") || "Portal de Operações",
    valorSetup: Number(g("valorSetup")) || 0,
    valorMensalidade: Number(g("valorMensalidade")) || 0,
    diaVencimento: g("diaVencimento") || "5",
    dataAssinatura: g("dataAssinatura"),
    cidadeAssinatura: g("cidadeAssinatura") || "Serra",
    ufAssinatura: (g("ufAssinatura") || "ES").toUpperCase()
  };

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
  if (!dados.dataAssinatura) faltando.push("Data de assinatura");

  return { dados, faltando };
}

// ---- Pré-visualizar (sem salvar) ------------------------------------------
function onPreview(e) {
  e.preventDefault();
  const { dados } = coletar();
  sessionStorage.setItem("preview_contrato", JSON.stringify(dados));
  window.open("contrato.html?preview=1", "_blank");
}

// ---- Gerar e salvar --------------------------------------------------------
async function onSubmit(e) {
  e.preventDefault();
  const { dados, faltando } = coletar();
  if (faltando.length) {
    alert("Preencha os campos obrigatórios:\n\n• " + faltando.join("\n• "));
    return;
  }

  if (!firebaseAtivo()) {
    // Sem banco: abre a pré-visualização para impressão.
    alert("Firebase não configurado — o contrato será apenas exibido para impressão.\nConfigure o Firebase para gerar o link de assinatura.");
    onPreview(e);
    return;
  }

  const btn = e.submitter;
  btn.disabled = true; btn.textContent = "Salvando...";
  try {
    const id = await salvarContrato(dados);
    const url = `${location.origin}${location.pathname.replace(/index\.html$/, "")}contrato.html?id=${id}`;
    mostrarLink(url);
  } catch (err) {
    console.error(err);
    alert("Erro ao salvar o contrato. Verifique a configuração do Firebase e as regras do Firestore.\n\n" + err.message);
  } finally {
    btn.disabled = false; btn.textContent = "✚ Gerar contrato e criar link";
  }
}

function mostrarLink(url) {
  document.getElementById("link-gerado").value = url;
  document.getElementById("btn-abrir").href = url;
  document.getElementById("modal-link").classList.add("show");
}
function copiarLink() {
  const inp = document.getElementById("link-gerado");
  inp.select();
  navigator.clipboard?.writeText(inp.value);
  const b = document.getElementById("btn-copiar");
  b.textContent = "Copiado!";
  setTimeout(() => (b.textContent = "Copiar"), 1500);
}
