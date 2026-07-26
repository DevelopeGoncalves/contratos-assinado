// ============================================================================
//  proposta.html — gerador de proposta comercial (admin). Preview + PDF.
// ============================================================================
import { exigirLogin, sair, obterConfig } from "./db.js";
import { gerarPropostaHTML, PROPOSTA_PADRAO } from "./proposal-template.js?v=4";

const $ = (id) => document.getElementById(id);
let CFG = null;

$("btn-sair").addEventListener("click", async (e) => { e.preventDefault(); await sair(); location.href = "index.html"; });

exigirLogin(async () => {
  try { CFG = await obterConfig(); } catch (e) { console.warn(e); }
  $("carregando").style.display = "none";
  $("app").style.display = "block";
  preencherPadrao();
  render();
  $("form-prop").addEventListener("input", render);
  $("btn-pdf").addEventListener("click", () => window.print());
});

function preencherPadrao() {
  const f = $("form-prop").elements;
  const p = PROPOSTA_PADRAO;
  f.objetivo.value = p.objetivo;
  f.dataEmissao.value = new Date().toISOString().slice(0, 10);
  f.validadeDias.value = p.validadeDias;
  f.precoMercado.value = p.precoMercado;
  f.consideracoes.value = p.consideracoes;
  f.op1_titulo.value = p.opcao1.titulo;
  f.op1_precoTabela.value = p.opcao1.precoTabela;
  f.op1_implantacao.value = p.opcao1.implantacao;
  f.op1_mensalidade.value = p.opcao1.mensalidade;
  f.op1_recursos.value = p.opcao1.recursos.join("\n");
  f.op2_titulo.value = p.opcao2.titulo;
  f.op2_precoTabela.value = p.opcao2.precoTabela;
  f.op2_implantacao.value = p.opcao2.implantacao;
  f.op2_mensalidade.value = p.opcao2.mensalidade;
  f.op2_recursos.value = p.opcao2.recursos.join("\n");
}

function coletar() {
  const f = $("form-prop").elements;
  const g = (n) => f[n].value;
  const linhas = (n) => g(n).split("\n").map((s) => s.trim()).filter(Boolean);
  const destaque = (f.destaque.value !== undefined)
    ? (document.querySelector('[name="destaque"]:checked')?.value ?? "2") : "2";
  return {
    cliente: g("cliente").trim(),
    objetivo: g("objetivo"),
    dataEmissao: g("dataEmissao"),
    validadeDias: Number(g("validadeDias")) || 15,
    precoMercado: Number(g("precoMercado")) || 0,
    consideracoes: g("consideracoes"),
    recursos: PROPOSTA_PADRAO.recursos,
    destaque,
    opcao1: {
      titulo: g("op1_titulo"), precoTabela: Number(g("op1_precoTabela")) || 0,
      implantacao: Number(g("op1_implantacao")) || 0, mensalidade: Number(g("op1_mensalidade")) || 0,
      recursos: linhas("op1_recursos")
    },
    opcao2: {
      titulo: g("op2_titulo"), precoTabela: Number(g("op2_precoTabela")) || 0,
      implantacao: Number(g("op2_implantacao")) || 0, mensalidade: Number(g("op2_mensalidade")) || 0,
      recursos: linhas("op2_recursos")
    }
  };
}

function render() {
  $("doc-alvo").innerHTML = gerarPropostaHTML(coletar(), CFG || {});
}
