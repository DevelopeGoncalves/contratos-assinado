// ============================================================================
//  CONFIGURAÇÃO DO FIREBASE — projeto "gerador-de-contratos"
// ----------------------------------------------------------------------------
//  Estas chaves PODEM ficar públicas: elas apenas identificam o projeto.
//  Quem realmente protege os dados são:
//    1) o Firebase Authentication (só você, logado, edita/gera contratos);
//    2) as regras do Firestore (arquivo firestore.rules).
//  Nenhuma senha do sistema fica mais escrita no código.
// ============================================================================

export const firebaseConfig = {
  apiKey: "AIzaSyBUtGO2uYlDADrL-k6ttOl0-KPQfYUKp5g",
  authDomain: "gerador-de-contratos-36d33.firebaseapp.com",
  projectId: "gerador-de-contratos-36d33",
  storageBucket: "gerador-de-contratos-36d33.firebasestorage.app",
  messagingSenderId: "572331480594",
  appId: "1:572331480594:web:b40f3011eca090f7592acb"
};

// Verifica se o Firebase já foi configurado de fato.
export function isConfigured() {
  return !Object.values(firebaseConfig).some(
    (v) => typeof v === "string" && (v.startsWith("COLOQUE_") || v === "")
  );
}
