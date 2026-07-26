// ============================================================================
//  MODELO DO CONTRATO  —  gera o HTML do contrato a partir dos dados.
//
//  Os dados da CONTRATADA (Victorino Eng) já estão fixos aqui.
//  Só os dados do CONTRATANTE (cliente) e os valores vêm do formulário.
//
//  Alterações solicitadas em relação ao contrato original:
//   • Cláusula 3ª: reajuste passa a ser de +50% a cada 12 meses.
//   • Cláusula 6ª: carência (fidelidade) passa de 6 meses para 1 ano (12 meses).
// ============================================================================
import { formatarMoeda, valorPorExtenso, dataPorExtenso } from "./utils.js";

// ---- DADOS FIXOS DA CONTRATADA (VICTORINO ENG) ----------------------------
export const CONTRATADA = {
  razaoSocial: "VICTORINO ENG",
  cnpj: "64.519.252/0001-04",
  endereco: "Avenida Presidente Dutra, nº 121, Jardim Carapina, Serra - ES",
  site: "victorinoeng.com.br",
  repNome: "Alex Gonçalves Victorino",
  repCargo: "Sócio-Administrador e Diretor de Tecnologia",
  repCpf: "157.924.627-39"
};

// Monta o parágrafo de qualificação do CONTRATANTE (PJ ou PF).
function qualificacaoContratante(d) {
  const e = d.endereco || {};
  const endereco = [
    e.logradouro && `${e.logradouro}${e.numero ? `, nº ${e.numero}` : ""}`,
    e.complemento,
    e.bairro,
    (e.cidade || e.uf) && `${e.cidade || ""}${e.uf ? ` - ${e.uf}` : ""}`,
    e.cep && `CEP ${e.cep}`
  ].filter(Boolean).join(", ");

  if (d.tipoCliente === "PJ") {
    return `<strong>CONTRATANTE:</strong> <strong>${d.razaoSocial || "—"}</strong>, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${d.cnpj || "—"}, com sede à ${endereco || "—"}, neste ato representada por ${d.repNome ? `<strong>${d.repNome}</strong>` : "—"}${d.repRg ? `, portador(a) da Carteira de Identidade nº ${d.repRg}` : ""}${d.repCpf ? ` e inscrito(a) no CPF sob o nº ${d.repCpf}` : ""}, doravante denominada simplesmente <strong>CONTRATANTE</strong>.`;
  }
  // Pessoa Física
  const extras = [
    d.nacionalidade,
    d.estadoCivil,
    d.profissao
  ].filter(Boolean).join(", ");
  return `<strong>CONTRATANTE:</strong> <strong>${d.nome || "—"}</strong>, ${extras ? extras + ", " : ""}portador(a) da Carteira de Identidade nº ${d.rg || "—"} e inscrito(a) no CPF sob o nº ${d.cpf || "—"}, residente e domiciliado(a) à ${endereco || "—"}, doravante denominada simplesmente <strong>CONTRATANTE</strong>.`;
}

// Rótulo de identificação do cliente (usado nas assinaturas e listagens).
export function nomeCliente(d) {
  return d.tipoCliente === "PJ" ? (d.razaoSocial || "—") : (d.nome || "—");
}
export function docCliente(d) {
  return d.tipoCliente === "PJ" ? (d.cnpj || "—") : (d.cpf || "—");
}
function assinanteCliente(d) {
  return d.tipoCliente === "PJ" ? (d.repNome || d.razaoSocial || "—") : (d.nome || "—");
}

// Gera o HTML completo do corpo do contrato.
export function gerarContratoHTML(d) {
  const objeto = d.objeto || "Portal de Operações";
  const setup = formatarMoeda(d.valorSetup);
  const setupExt = valorPorExtenso(d.valorSetup);
  const mens = formatarMoeda(d.valorMensalidade);
  const mensExt = valorPorExtenso(d.valorMensalidade);
  const dia = String(d.diaVencimento || "05").padStart(2, "0");
  const cidade = d.cidadeAssinatura || "Serra";
  const uf = d.ufAssinatura || "ES";
  const dataExt = dataPorExtenso(d.dataAssinatura);

  return `
  <div class="doc">
    <h1>CONTRATO DE LICENCIAMENTO DE SOFTWARE (SAAS)<br>E PRESTAÇÃO DE SERVIÇOS DE INFRAESTRUTURA E SUPORTE</h1>

    <p>Pelo presente instrumento particular, de um lado de forma justa e acordada, têm entre si estabelecido as partes abaixo qualificadas:</p>

    <p><strong>CONTRATADA:</strong> <strong>${CONTRATADA.razaoSocial}</strong>, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${CONTRATADA.cnpj}, com sede à ${CONTRATADA.endereco}, inscrita e regularmente constituída nos termos da legislação vigente, com presença digital por meio do sítio eletrônico ${CONTRATADA.site}, neste ato representada por seu ${CONTRATADA.repCargo}, <strong>${CONTRATADA.repNome}</strong>, portador do CPF nº ${CONTRATADA.repCpf}, doravante denominada simplesmente <strong>CONTRATADA</strong>.</p>

    <p>${qualificacaoContratante(d)}</p>

    <p>As partes acima identificadas regulam o presente Contrato de Licenciamento de Uso de Software e Prestação de Serviços, que se regerá pelas cláusulas e condições pactuadas a seguir:</p>

    <h2>CLÁUSULA 1ª – DO OBJETO E PROPRIEDADE INTELECTUAL</h2>
    <p>1.1. O presente contrato tem por objeto a concessão de licença de uso do software de gestão empresarial em nuvem denominado "${objeto}", doravante chamado de "Software", em caráter revogável, não exclusivo e intransferível (Modelo SaaS - Software as a Service).</p>
    <p><strong>PROPRIEDADE EXCLUSIVA:</strong> Fica expressamente estabelecido e amparado pela Lei de Proteção de Propriedade Intelectual de Programa de Computador (Lei nº 9.609/98) e pela Lei de Direitos Autorais (Lei nº 9.610/98) que a CONTRATANTE <strong>NÃO</strong> adquire nenhum direito de propriedade, direitos autorais ou acesso ao código-fonte sobre o Software. O sistema, suas lógicas, telas e algoritmos pertencem única e exclusivamente à empresa VICTORINO ENG e ao seu titular, Alex Gonçalves Victorino. O cliente adquire apenas o direito de USO TEMPORÁRIO da ferramenta enquanto o contrato estiver ativo e adimplente.</p>

    <h2>CLÁUSULA 2ª – DA TAXA DE IMPLEMENTAÇÃO (SETUP)</h2>
    <p>2.1. Pelos serviços iniciais de configuração de servidores, criação de banco de dados isolado, parametrização do sistema, liberação de credenciais seguras e treinamento primário de uso, a CONTRATANTE concorda em pagar à CONTRATADA o valor único de R$ ${setup} (${setupExt}).</p>
    <p>2.2. A CONTRATANTE declara ciência de que este valor remunera exclusivamente os esforços técnicos de infraestrutura e o tempo do engenheiro de software para a preparação do ambiente digital, não lhe conferindo a compra do sistema. Em nenhuma hipótese este valor será reembolsável.</p>

    <h2>CLÁUSULA 3ª – DA MENSALIDADE, HOSPEDAGEM E SUPORTE</h2>
    <p>3.1. Pelo licenciamento contínuo do Software, hospedagem dos dados na nuvem e suporte técnico, a CONTRATANTE pagará mensalmente à CONTRATADA o valor de R$ ${mens} (${mensExt}).</p>
    <p>3.2. O pagamento deverá ser efetuado até o dia ${dia} (${valorPorExtenso(Number(dia)).replace(/ reais?$/,"")}) de cada mês, por meio do gateway de pagamento oficial da CONTRATADA (boleto, cartão ou PIX).</p>
    <p>3.3. O valor da mensalidade será reajustado a cada 12 (doze) meses, contados da data de assinatura deste instrumento, mediante acréscimo de <strong>50% (cinquenta por cento)</strong> sobre o valor da parcela vigente no período anterior, a título de recomposição e atualização do serviço prestado.</p>

    <h2>CLÁUSULA 4ª – DA LIMITAÇÃO DE ESCOPO E "NOVAS FUNCIONALIDADES"</h2>
    <p>4.1. Fica expressamente acordado que a mensalidade descrita na Cláusula 3ª garante apenas o acesso ao sistema "no estado em que se encontra", a manutenção da infraestrutura em nuvem e a correção de eventuais falhas lógicas originárias do sistema (bugs).</p>
    <p><strong>PROTEÇÃO DO ESCOPO TÉCNICO:</strong> A CONTRATADA não está sob nenhuma obrigação de desenvolver novas telas, rotinas personalizadas, integrações com terceiros ou modificações estruturais que a CONTRATANTE deseje. Caso a CONTRATANTE solicite melhorias e funcionalidades não previstas, estas serão tratadas como Desenvolvimento Extraordinário, sendo a CONTRATADA livre para enviar orçamento de horas de programação e taxas separadas, que poderão ser aprovadas ou recusadas pelo cliente, mantendo-se a total independência técnica da VICTORINO ENG.</p>

    <h2>CLÁUSULA 5ª – DA INADIMPLÊNCIA E DO BLOQUEIO AUTOMÁTICO</h2>
    <p>5.1. O Software licenciado possui um mecanismo tecnológico automatizado de verificação de licença atrelado aos pagamentos. Em caso de não identificação do pagamento na data de vencimento, haverá um prazo de tolerância de até 05 (cinco) dias.</p>
    <p>5.2. No 6º (sexto) dia corrido de atraso, o sistema bloqueará automaticamente o acesso de todos os usuários da CONTRATANTE, sem necessidade de qualquer aviso prévio ou intervenção humana. O acesso só será restabelecido automaticamente após a efetiva compensação bancária e identificação do pagamento pela operadora financeira.</p>
    <p>5.3. <strong>ENCARGOS MORATÓRIOS:</strong> Sobre qualquer valor pago em atraso incidirá, de pleno direito, multa moratória de 2% (dois por cento) e juros de mora de 1% (um por cento) ao mês, calculados pro rata die (Art. 406 do Código Civil Brasileiro).</p>

    <h2>CLÁUSULA 6ª – DA FIDELIDADE, MULTA COMPENSATÓRIA E RESCISÃO</h2>
    <p>6.1. O presente contrato possui um prazo de fidelidade mínimo e obrigatório de <strong>01 (um) ano — 12 (doze) meses</strong> a partir da assinatura e implantação.</p>
    <p>6.2. <strong>MULTA RESCISÓRIA:</strong> A rescisão antecipada por iniciativa da CONTRATANTE, antes de esgotado o período de fidelidade mínimo, acarretará a cobrança de multa compensatória correspondente a 50% (cinquenta por cento) da soma das mensalidades vincendas até a finalização do décimo segundo (12º) mês (fundamentada nos Artigos 412 e 413 do Código Civil).</p>
    <p>6.3. Cumprido o período inicial de fidelidade, o contrato será automaticamente renovado por prazo indeterminado. Qualquer das partes poderá rescindi-lo, a qualquer tempo, bastando um aviso prévio por escrito com antecedência mínima de 30 (trinta) dias.</p>
    <p>6.4. A CONTRATANTE deverá realizar o pagamento referente ao mês do aviso prévio e providenciar a extração dos seus próprios relatórios e dados da plataforma antes da efetiva exclusão de sua base de dados pela CONTRATADA.</p>

    <h2>CLÁUSULA 7ª – ISENÇÃO DE RESPONSABILIDADE E LGPD</h2>
    <p>7.1. A CONTRATADA isenta-se expressamente de responsabilidade por eventuais lucros cessantes, prejuízos comerciais ou danos de qualquer natureza oriundos da impossibilidade de uso do Software motivada por falhas na conexão de internet da CONTRATANTE, vírus ou malwares nos equipamentos locais da CONTRATANTE, bem como pelo preenchimento ou parametrização incorreta de dados por seus operadores.</p>
    <p>7.2. Ambas as partes comprometem-se a observar integralmente as diretrizes da Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), figurando a CONTRATADA como operadora da infraestrutura técnica do software e a CONTRATANTE como titular e controladora legal exclusiva dos dados empresariais e pessoais inseridos na plataforma.</p>

    <h2>CLÁUSULA 8ª – DO FORO</h2>
    <p>8.1. Para dirimir quaisquer litígios ou controvérsias decorrentes da interpretação ou execução deste instrumento, as partes elegem o Foro da Comarca de Serra - Estado do Espírito Santo, com renúncia expressa a qualquer outro, por mais privilegiado que venha a ser.</p>

    <p>E por estarem assim justas e contratadas, as partes assinam o presente instrumento em 02 (duas) vias de igual teor e forma para um só efeito.</p>

    <p class="local-data">${cidade}/${uf}, ${dataExt || "____ de __________ de ______"}.</p>

    <div class="assinaturas">
      <div class="assbloco">
        <div class="assline" id="ass-contratada"></div>
        <p><strong>${CONTRATADA.razaoSocial}</strong><br>CNPJ: ${CONTRATADA.cnpj}<br>${CONTRATADA.repNome} (CONTRATADA)</p>
      </div>
      <div class="assbloco">
        <div class="assline" id="ass-contratante">${d.assinatura && d.assinatura.dataURL ? `<img src="${d.assinatura.dataURL}" alt="assinatura">` : ""}</div>
        <p><strong>${nomeCliente(d)}</strong><br>${d.tipoCliente === "PJ" ? "CNPJ" : "CPF"}: ${docCliente(d)}<br>${assinanteCliente(d)} (CONTRATANTE)</p>
      </div>
    </div>

    <div class="assinaturas testemunhas">
      <div class="assbloco"><div class="assline"></div><p>Testemunha 1<br>CPF:</p></div>
      <div class="assbloco"><div class="assline"></div><p>Testemunha 2<br>CPF:</p></div>
    </div>

    ${d.assinatura && d.assinatura.assinadoEm ? `<p class="carimbo">✔ Assinado eletronicamente por <strong>${d.assinatura.nome}</strong> em ${new Date(d.assinatura.assinadoEm).toLocaleString("pt-BR")} — aceite registrado digitalmente (art. 10, §2º, MP 2.200-2/2001).</p>` : ""}
  </div>`;
}
