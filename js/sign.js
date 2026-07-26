// ============================================================================
//  Página do contrato: exibição, pré-visualização e assinatura do cliente.
// ============================================================================
import { buscarContrato, assinarContrato, firebaseAtivo } from "./db.js";
import { gerarContratoHTML, nomeCliente } from "./contract-template.js";

const params = new URLSearchParams(location.search);
const id = params.get("id");
const isPreview = params.get("preview") === "1";
const conteudo = document.getElementById("conteudo");

init();

async function init() {
  let dados = null;

  if (isPreview) {
    dados = JSON.parse(sessionStorage.getItem("preview_contrato") || "null");
    if (!dados) return erro("Nada para pré-visualizar.");
    render(dados, { preview: true });
    return;
  }

  if (!id) return erro("Link inválido: contrato não especificado.");
  if (!firebaseAtivo()) return erro("O banco de dados (Firebase) não está configurado neste site.");

  try {
    dados = await buscarContrato(id);
  } catch (e) {
    console.error(e);
    return erro("Não foi possível carregar o contrato. Verifique sua conexão.");
  }
  if (!dados) return erro("Contrato não encontrado. O link pode estar incorreto ou o contrato foi removido.");

  render(dados, { preview: false });
}

function erro(msg) {
  conteudo.innerHTML = `<div class="card"><div class="banner warn"><span>⚠️</span><span>${msg}</span></div></div>`;
}

function render(dados, { preview }) {
  const jaAssinado = dados.status === "assinado";
  let html = gerarContratoHTML(dados);

  if (preview) {
    html += `<div class="sign-panel no-print"><div class="banner info"><span>👁</span>
      <span>Este é apenas um <strong>preview</strong>. Ele não foi salvo e o cliente ainda não pode assinar.
      Volte e clique em <strong>"Gerar contrato e criar link"</strong> para enviar ao cliente.</span></div></div>`;
  } else if (jaAssinado) {
    html += `<div class="sign-panel no-print"><div class="banner ok"><span>✅</span>
      <span>Contrato <strong>assinado</strong> por ${dados.assinatura?.nome || nomeCliente(dados)} em
      ${dados.assinatura?.assinadoEm ? new Date(dados.assinatura.assinadoEm).toLocaleString("pt-BR") : ""}.
      Use "Baixar PDF / Imprimir" para salvar a via assinada.</span></div></div>`;
  } else {
    html += painelAssinaturaHTML(dados);
  }

  conteudo.innerHTML = html;

  if (!preview && !jaAssinado) ativarAssinatura(dados);
}

// ---- Painel de assinatura --------------------------------------------------
function painelAssinaturaHTML(dados) {
  return `
  <div class="sign-panel no-print" id="painel-ass">
    <h3>✍️ Assinatura do contratante</h3>
    <p class="desc">Confirme a leitura, assine no quadro abaixo e finalize. A assinatura ficará registrada com data e hora.</p>

    <div class="field" style="margin-bottom:14px">
      <label>Nome completo de quem assina *</label>
      <input id="ass-nome" value="${dados.tipoCliente === "PJ" ? (dados.repNome || "") : (dados.nome || "")}" placeholder="Digite seu nome completo">
    </div>

    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:#33475b">Desenhe sua assinatura *</label>
    <div class="pad-wrap">
      <canvas id="pad"></canvas>
      <div class="pad-hint" id="pad-hint">Assine aqui com o mouse ou o dedo</div>
    </div>
    <div class="actions" style="margin-top:10px">
      <button type="button" class="btn btn-ghost" id="btn-limpar">↺ Limpar assinatura</button>
    </div>

    <div class="check-line">
      <input type="checkbox" id="ass-aceite">
      <label for="ass-aceite">Li e concordo integralmente com todas as cláusulas deste contrato e declaro serem verdadeiras as informações apresentadas.</label>
    </div>

    <button type="button" class="btn btn-primary btn-block" id="btn-assinar">✔ Assinar contrato</button>
    <div id="ass-erro" style="color:var(--vermelho);font-size:13px;margin-top:10px;display:none"></div>
  </div>`;
}

// ---- Signature pad (canvas) ------------------------------------------------
function ativarAssinatura(dados) {
  const canvas = document.getElementById("pad");
  const hint = document.getElementById("pad-hint");
  const ctx = canvas.getContext("2d");
  let desenhando = false, temTraco = false;

  function ajustar() {
    const r = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#122";
  }
  ajustar();
  window.addEventListener("resize", () => { const d = canvas.toDataURL(); ajustar(); });

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - r.left, y: p.clientY - r.top };
  }
  function start(e) { e.preventDefault(); desenhando = true; const { x, y } = pos(e); ctx.beginPath(); ctx.moveTo(x, y); }
  function move(e) {
    if (!desenhando) return; e.preventDefault();
    const { x, y } = pos(e); ctx.lineTo(x, y); ctx.stroke();
    if (!temTraco) { temTraco = true; hint.style.display = "none"; }
  }
  function end() { desenhando = false; }

  canvas.addEventListener("mousedown", start); canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", end);

  document.getElementById("btn-limpar").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); temTraco = false; hint.style.display = "grid";
  });

  document.getElementById("btn-assinar").addEventListener("click", async () => {
    const nome = document.getElementById("ass-nome").value.trim();
    const aceite = document.getElementById("ass-aceite").checked;
    const erro = document.getElementById("ass-erro");
    erro.style.display = "none";

    if (!nome) return falha("Informe o nome de quem está assinando.");
    if (!temTraco) return falha("Desenhe sua assinatura no quadro.");
    if (!aceite) return falha("Você precisa marcar que leu e concorda com o contrato.");

    const assinatura = {
      nome,
      dataURL: canvas.toDataURL("image/png"),
      assinadoEm: new Date().toISOString(),
      aceite: true,
      userAgent: navigator.userAgent
    };

    const btn = document.getElementById("btn-assinar");
    btn.disabled = true; btn.textContent = "Registrando assinatura...";
    try {
      await assinarContrato(id, assinatura);
      dados.status = "assinado"; dados.assinatura = assinatura;
      render(dados, { preview: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error(e);
      btn.disabled = false; btn.textContent = "✔ Assinar contrato";
      falha("Erro ao registrar a assinatura. Tente novamente. (" + e.message + ")");
    }

    function falha(m) { erro.textContent = m; erro.style.display = "block"; }
  });

  function falha(m) {
    const erro = document.getElementById("ass-erro");
    erro.textContent = m; erro.style.display = "block";
  }
}
