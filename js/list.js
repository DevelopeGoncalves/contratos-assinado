// ============================================================================
//  contratos.html — lista de contratos recebidos (admin).
// ============================================================================
import { exigirLogin, sair, listarContratos } from "./db.js";
import { nomeCliente, docCliente } from "./contract-template.js";
import { formatarMoeda } from "./utils.js";

document.getElementById("btn-sair").addEventListener("click", async (e) => {
  e.preventDefault(); await sair(); location.href = "index.html";
});

exigirLogin(async () => {
  document.getElementById("carregando").style.display = "none";
  document.getElementById("app").style.display = "block";
  carregar();
});

async function carregar() {
  const alvo = document.getElementById("lista");
  let itens = [];
  try {
    itens = await listarContratos();
  } catch (e) {
    console.error(e);
    alvo.innerHTML = `<div class="banner warn"><span>⚠️</span><span>Erro ao carregar: ${e.message}</span></div>`;
    return;
  }
  if (!itens.length) {
    alvo.innerHTML = `<div class="banner info"><span>ℹ️</span><span>Nenhum contrato recebido ainda.
      Compartilhe o link do cliente (na tela <a href="index.html">Início</a>).</span></div>`;
    return;
  }

  const data = (c) => {
    try { return c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString("pt-BR") : "—"; }
    catch { return "—"; }
  };
  const tagCls = { pendente: "pendente", revisado: "assinado", gerado: "assinado" };
  const tagTxt = { pendente: "Novo", revisado: "Revisado", gerado: "PDF gerado" };

  const linhas = itens.map((c) => `
    <tr>
      <td><strong>${nomeCliente(c)}</strong><br><small style="color:var(--cinza)">${c.tipoCliente} · ${docCliente(c)}</small></td>
      <td>R$ ${formatarMoeda(c.valorMensalidade)}/mês</td>
      <td>${data(c)}</td>
      <td><span class="tag ${tagCls[c.status] || "pendente"}">${tagTxt[c.status] || "Novo"}</span></td>
      <td><a href="contrato.html?id=${c.id}" class="btn btn-outline" style="padding:7px 14px;font-size:13px">Abrir</a></td>
    </tr>`).join("");

  alvo.innerHTML = `<table class="lista">
    <thead><tr><th>Cliente</th><th>Mensalidade</th><th>Recebido</th><th>Status</th><th></th></tr></thead>
    <tbody>${linhas}</tbody></table>`;
}
