// ============================================================================
//  Utilidades: máscaras, formatação de moeda e número por extenso (pt-BR)
// ============================================================================

// Formata número (em reais) como "1.234,56"
export function formatarMoeda(v) {
  const n = Number(v || 0);
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Formata data ISO (yyyy-mm-dd) como "18 de maio de 2026"
export function dataPorExtenso(iso) {
  if (!iso) return "";
  const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho",
    "agosto","setembro","outubro","novembro","dezembro"];
  const [a, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")} de ${meses[m - 1]} de ${a}`;
}

// ---- Número por extenso (0 a 999.999,99) em reais -------------------------
const UNI = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const DEZ10 = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const DEZ = ["", "dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CEM = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

function trioExtenso(n) {
  if (n === 0) return "";
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const dz = Math.floor(resto / 10);
  const un = resto % 10;
  const partes = [];
  if (c) partes.push(CEM[c]);
  if (resto >= 10 && resto < 20) partes.push(DEZ10[resto - 10]);
  else {
    if (dz) partes.push(DEZ[dz]);
    if (un) partes.push(UNI[un]);
  }
  return partes.join(" e ");
}

// Converte um valor numérico para extenso completo em reais.
export function valorPorExtenso(valor) {
  const num = Math.floor(Number(valor || 0));
  const cent = Math.round((Number(valor || 0) - num) * 100);

  let texto = "";
  if (num === 0) {
    texto = "zero real";
  } else {
    const milhar = Math.floor(num / 1000);
    const resto = num % 1000;
    const partes = [];
    if (milhar) {
      partes.push(milhar === 1 ? "mil" : `${trioExtenso(milhar)} mil`);
    }
    if (resto) {
      partes.push(trioExtenso(resto));
    }
    texto = partes.join(" e ") + (num === 1 ? " real" : " reais");
  }

  if (cent > 0) {
    texto += ` e ${trioExtenso(cent)} ${cent === 1 ? "centavo" : "centavos"}`;
  }
  return texto;
}

// Máscaras simples aplicáveis em inputs.
export function mascaraCNPJ(v) {
  return v.replace(/\D/g, "").slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}
export function mascaraCPF(v) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
export function mascaraCEP(v) {
  return v.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
}
export function mascaraDinheiro(v) {
  let n = v.replace(/\D/g, "");
  n = (Number(n) / 100).toFixed(2);
  return n;
}
