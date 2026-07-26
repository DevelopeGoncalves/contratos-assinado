// ============================================================================
//  configuracoes.html — edição da config (empresa + valores). Só admin.
// ============================================================================
import { exigirLogin, sair, obterConfig, salvarConfig } from "./db.js";
import { CONFIG_PADRAO } from "./contract-template.js";

const $ = (id) => document.getElementById(id);

document.getElementById("btn-sair").addEventListener("click", async (e) => {
  e.preventDefault(); await sair(); location.href = "index.html";
});

exigirLogin(async () => {
  $("carregando").style.display = "none";
  $("app").style.display = "block";
  await carregar();
  $("form-cfg").addEventListener("submit", salvar);
});

function preencher(cfg) {
  const emp = cfg.empresa || {};
  const f = $("form-cfg").elements;
  const set = (n, v) => { if (f[n] != null) f[n].value = v ?? ""; };
  set("razaoSocial", emp.razaoSocial); set("cnpj", emp.cnpj); set("endereco", emp.endereco);
  set("site", emp.site); set("repNome", emp.repNome); set("repCargo", emp.repCargo); set("repCpf", emp.repCpf);
  set("objeto", cfg.objeto); set("valorSetup", cfg.valorSetup); set("valorMensalidade", cfg.valorMensalidade);
  set("diaVencimento", cfg.diaVencimento); set("cidadeAssinatura", cfg.cidadeAssinatura);
  set("ufAssinatura", cfg.ufAssinatura); set("foroComarca", cfg.foroComarca);
  set("fidelidadeMeses", cfg.fidelidadeMeses); set("reajustePercent", cfg.reajustePercent);
}

async function carregar() {
  let cfg = null;
  try { cfg = await obterConfig(); } catch (e) { console.error(e); }
  // Se ainda não existe config, pré-preenche com os dados da Victorino Eng.
  preencher(cfg || CONFIG_PADRAO);
  if (!cfg) {
    mostrarMsg("Config ainda não salva. Revise os dados abaixo e clique em Salvar.", "warn");
  }
}

async function salvar(e) {
  e.preventDefault();
  const f = e.target.elements;
  const g = (n) => f[n].value.trim();
  const dados = {
    empresa: {
      razaoSocial: g("razaoSocial"), cnpj: g("cnpj"), endereco: g("endereco"),
      site: g("site"), repNome: g("repNome"), repCargo: g("repCargo"), repCpf: g("repCpf")
    },
    objeto: g("objeto") || "Portal de Operações",
    valorSetup: Number(g("valorSetup")) || 0,
    valorMensalidade: Number(g("valorMensalidade")) || 0,
    diaVencimento: g("diaVencimento") || "5",
    cidadeAssinatura: g("cidadeAssinatura") || "Serra",
    ufAssinatura: (g("ufAssinatura") || "ES").toUpperCase(),
    foroComarca: g("foroComarca") || "Serra - Estado do Espírito Santo",
    fidelidadeMeses: Number(g("fidelidadeMeses")) || 12,
    reajustePercent: Number(g("reajustePercent")) || 50
  };

  const btn = e.submitter;
  btn.disabled = true; btn.textContent = "Salvando...";
  try {
    await salvarConfig(dados);
    mostrarMsg("✅ Configurações salvas com sucesso!", "ok");
  } catch (err) {
    console.error(err);
    mostrarMsg("Erro ao salvar: " + err.message + " (verifique as regras do Firestore)", "warn");
  } finally {
    btn.disabled = false; btn.textContent = "💾 Salvar configurações";
  }
}

function mostrarMsg(txt, tipo) {
  const el = $("cfg-msg");
  el.className = "banner " + (tipo === "ok" ? "ok" : "warn");
  el.textContent = txt;
  el.style.display = "flex";
}
