// ============================================================================
//  CONFIGURAÇÃO DO FIREBASE  —  PREENCHA COM OS DADOS DO SEU PROJETO
// ----------------------------------------------------------------------------
//  Onde pegar:  console.firebase.google.com  ->  seu projeto  ->
//  Configurações do projeto (engrenagem)  ->  "Seus apps"  ->  App da Web (</>)
//  ->  copie o objeto "firebaseConfig" e cole abaixo.
//
//  Depois de colar, o sistema passa a salvar os contratos e assinaturas.
//  Enquanto estiver com os valores "COLOQUE_..." o sistema ainda gera e
//  imprime o contrato, mas NÃO salva no banco nem gera link de assinatura.
// ============================================================================

export const firebaseConfig = {
  apiKey: "COLOQUE_SUA_API_KEY",
  authDomain: "COLOQUE_SEU_PROJETO.firebaseapp.com",
  projectId: "COLOQUE_SEU_PROJECT_ID",
  storageBucket: "COLOQUE_SEU_PROJETO.appspot.com",
  messagingSenderId: "COLOQUE_SEU_SENDER_ID",
  appId: "COLOQUE_SEU_APP_ID"
};

// ----------------------------------------------------------------------------
//  SENHA DE ACESSO AO PAINEL (área administrativa)
//  Troque por uma senha sua. É uma proteção simples do dia a dia para as
//  telas de criação/listagem de contratos. Para segurança forte, veja o
//  README (seção "Segurança" — ativar Firebase Authentication).
// ----------------------------------------------------------------------------
export const ADMIN_SENHA = "victorino2026";

// Verifica se o Firebase já foi configurado de fato.
export function isConfigured() {
  return !Object.values(firebaseConfig).some(
    (v) => typeof v === "string" && v.startsWith("COLOQUE_")
  );
}
