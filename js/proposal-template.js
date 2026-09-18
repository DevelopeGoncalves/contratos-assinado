// ============================================================================
//  MODELO DA PROPOSTA COMERCIAL — gera o HTML a partir dos dados do form.
//  Mostra o "Preço de tabela" (original, riscado) x "preço com desconto".
// ============================================================================
import { formatarMoeda, dataPorExtenso } from "./utils.js";
import { CONFIG_PADRAO } from "./contract-template.js?v=4";

export const PROPOSTA_PADRAO = {
  cliente: "",
  objetivo: "Implantação de Sistema de Gestão Comercial, Estoque e Cardápio Digital",
  validadeDias: 15,
  precoMercado: 1500,
  consideracoes:
    "Esta proposta foi desenhada sob medida para a {cliente}. Entendemos que o início de uma operação exige foco total em vendas e custos enxutos. Para apoiar a abertura e a estruturação do seu negócio, estamos apresentando uma política de preços exclusiva e temporária, muito abaixo dos valores que praticamos no mercado.\n\nO objetivo do sistema é simplificar a sua rotina: eliminar os erros de anotação de pedidos, controlar os insumos para evitar desperdícios e agilizar a entrega para o cliente final.",
  recursos: [
    ["Cardápio Digital Exclusivo", "Um link próprio para enviar aos clientes pelo WhatsApp. O cliente monta o pedido sozinho e envia. O lucro é 100% seu, livre de taxas ou comissões por venda."],
    ["Controle de Estoque Inteligente", "Acabou algum insumo? Você pausa o item no painel e ele sai do ar no cardápio na mesma hora, evitando reclamações por pedidos cancelados."],
    ["Painel de Pedidos em Tempo Real", "Os pedidos chegam instantaneamente na sua tela com alerta sonoro, prontos para produção, organizando a fila sem bagunça."],
    ["Fechamento de Caixa Sem Dor de Cabeça", "Saiba exatamente quanto faturou no dia em dinheiro, PIX ou cartão. Relatórios simples para você controlar o seu lucro real."]
  ],
  destaque: "2",
  opcao1: {
    titulo: "Sistema + Cardápio Próprio",
    precoTabela: 1500, implantacao: 700, mensalidade: 200,
    recursos: [
      "Sistema completo de gestão comercial",
      "Gerenciador de estoque integrado",
      "Cardápio Digital próprio (sem taxas)",
      "Treinamento completo de uso",
      "Suporte direto para dúvidas"
    ]
  },
  opcao2: {
    titulo: "Sistema Completo + iFood",
    precoTabela: 1900, implantacao: 900, mensalidade: 300,
    recursos: [
      "Todos os recursos da Opção 01",
      "Integração direta com o iFood",
      "Os pedidos do iFood entram direto na sua tela",
      "Estoque do iFood atualiza junto com o sistema",
      "Não precisa usar o app Gestor do iFood"
    ]
  }
};

function desconto(tabela, preco) {
  tabela = Number(tabela) || 0; preco = Number(preco) || 0;
  if (!tabela || preco >= tabela) return 0;
  return Math.round((1 - preco / tabela) * 100);
}

function opcaoHTML(op, n, destaque, badgeTxt = "★ MAIS VANTAJOSO") {
  const off = desconto(op.precoTabela, op.implantacao);
  const recursos = (op.recursos || []).map((r) => `<li>${r}</li>`).join("");
  return `
  <div class="op-card ${destaque ? "op-destaque" : ""}">
    ${destaque ? `<div class="op-badge">${badgeTxt}</div>` : ""}
    <div class="op-num">Opção ${String(n).padStart(2, "0")}</div>
    <h3>${op.titulo || ""}</h3>
    <div class="op-precos">
      <div class="op-tabela"><span>Preço padrão de tabela</span><s>R$ ${formatarMoeda(op.precoTabela)}</s></div>
      <div class="op-implant">
        <span>Sua taxa de implantação</span>
        <strong>R$ ${formatarMoeda(op.implantacao)}</strong>
        ${off > 0 ? `<em class="op-off">−${off}%</em>` : ""}
      </div>
      <div class="op-mens">+ Mensalidade de <strong>R$ ${formatarMoeda(op.mensalidade)}</strong></div>
    </div>
    <ul class="op-recursos">${recursos}</ul>
  </div>`;
}

export function gerarPropostaHTML(d, cfg = {}) {
  const emp = cfg.empresa || CONFIG_PADRAO.empresa;
  const cliente = d.cliente || "—";
  const consid = (d.consideracoes || "").replace(/\{cliente\}/g, cliente)
    .split(/\n\s*\n/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
  const recursos = (d.recursos || []).map(([t, x]) => `
    <div class="rec-card"><h4>${t}</h4><p>${x}</p></div>`).join("");
  const dataEmissao = d.dataEmissao ? dataPorExtenso(d.dataEmissao) : dataPorExtenso(new Date().toISOString().slice(0, 10));

  // "mostrar" define o que aparece: só a Opção 01, só a Opção 02, ou as duas.
  const mostrar = d.mostrar || "ambas";
  let opcoes;
  if (mostrar === "1") {
    opcoes = opcaoHTML(d.opcao1, 1, true, "★ OPÇÃO ESCOLHIDA");
  } else if (mostrar === "2") {
    opcoes = opcaoHTML(d.opcao2, 2, true, "★ OPÇÃO ESCOLHIDA");
  } else {
    opcoes = opcaoHTML(d.opcao1, 1, d.destaque === "1") + opcaoHTML(d.opcao2, 2, d.destaque !== "1");
  }

  return `
  <div class="doc proposta">
    <div class="doc-logo"><img src="img/logo_horizontal.png" alt="${emp.razaoSocial}"></div>

    <div class="prop-head">
      <div class="prop-empresa">
        <strong>${emp.razaoSocial}</strong><br>
        CNPJ: ${emp.cnpj}<br>
        <span>Sistemas de Gestão Comercial e Automação</span>
      </div>
    </div>

    <h1 class="prop-titulo">Proposta Comercial — ${cliente}</h1>
    <p class="prop-meta">Data de emissão: ${dataEmissao} &nbsp;|&nbsp; Condição válida por ${d.validadeDias || 15} dias</p>

    <div class="prop-dest">
      <div><span>Destinatário</span><strong>${cliente}</strong></div>
      <div><span>Objetivo</span><strong>${d.objetivo || ""}</strong></div>
    </div>

    <h2>1. Considerações iniciais</h2>
    ${consid}

    <h2>2. Recursos inclusos no sistema</h2>
    <div class="rec-grid">${recursos}</div>

    <p class="prop-nota"><strong>Atenção:</strong> nosso valor padrão de tabela para a montagem e liberação deste sistema é de <strong>R$ ${formatarMoeda(d.precoMercado)}</strong> para qualquer cliente de mercado. As condições abaixo são <strong>exclusivas</strong> para a ${cliente}.</p>

    <h2>${mostrar === "ambas" ? "3. Opções de investimento e comparativo de desconto" : "3. Investimento"}</h2>
    <div class="op-grid ${mostrar === "ambas" ? "" : "op-grid-uma"}">
      ${opcoes}
    </div>

    <p class="prop-rodape">Proposta emitida por ${emp.razaoSocial} — ${emp.site || ""}. Estamos à disposição para tirar qualquer dúvida.</p>
  </div>`;
}
