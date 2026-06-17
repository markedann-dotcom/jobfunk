// Approximate German Brutto -> Netto calculator (2026 values, simplified).
// NOT tax advice. Lohnsteuer is estimated via a simplified progressive
// formula on the annual taxable income; social contributions use standard
// employee shares. Good enough for a rough orientation, clearly labeled.

export type Steuerklasse = 1 | 2 | 3 | 4 | 5 | 6;

export interface NettoInput {
  brutto: number; // monthly gross EUR
  steuerklasse: Steuerklasse;
  kirchensteuer: boolean; // 9% of Lohnsteuer (8% in BW/BY — we use 9% rough)
  kinderlos: boolean; // +0.6% Pflegeversicherung surcharge if 23+ & no kids
  bundesland?: "west" | "ost";
}

export interface NettoResult {
  brutto: number;
  netto: number;
  lohnsteuer: number;
  soli: number;
  kirchensteuer: number;
  rv: number; // Rentenversicherung
  av: number; // Arbeitslosenversicherung
  kv: number; // Krankenversicherung
  pv: number; // Pflegeversicherung
  sozialabgaben: number;
  steuern: number;
}

// 2026 contribution rates (employee share)
const RV_RATE = 0.093; // 18.6% / 2
const AV_RATE = 0.013; // 2.6% / 2
const KV_RATE = 0.073 + 0.0085; // 14.6%/2 + ~1.7% Zusatzbeitrag / 2
const PV_RATE_BASE = 0.018; // 3.6% / 2 (2026 approx)
const PV_KINDERLOS = 0.006; // surcharge for childless 23+

// 2026 contribution ceilings (monthly, approx)
const BBG_RV = 8050; // Renten-/Arbeitslosenversicherung
const BBG_KV = 5512.5; // Kranken-/Pflegeversicherung

// 2026 income tax (Einkommensteuer) — simplified Grundtarif
function lohnsteuerYear(zvE: number): number {
  // zvE = zu versteuerndes Einkommen (annual)
  const x = zvE;
  if (x <= 12096) return 0;
  if (x <= 17443) {
    const y = (x - 12096) / 10000;
    return Math.floor((932.3 * y + 1400) * y);
  }
  if (x <= 68480) {
    const z = (x - 17443) / 10000;
    return Math.floor((176.64 * z + 2397) * z + 1015.13);
  }
  if (x <= 277825) {
    return Math.floor(0.42 * x - 10911.92);
  }
  return Math.floor(0.45 * x - 19246.67);
}

const GRUNDFREIBETRAG = 12096; // 2026 approx
const ARBEITNEHMER_PAUSCHBETRAG = 1230; // Werbungskosten
const SONDERAUSGABEN = 36;

export function calcNetto(input: NettoInput): NettoResult {
  const brutto = Math.max(0, input.brutto);

  const baseRV = Math.min(brutto, BBG_RV);
  const baseKV = Math.min(brutto, BBG_KV);

  const rv = baseRV * RV_RATE;
  const av = baseRV * AV_RATE;
  const kv = baseKV * KV_RATE;
  const pvRate = PV_RATE_BASE + (input.kinderlos ? PV_KINDERLOS : 0);
  const pv = baseKV * pvRate;

  const sozialabgaben = rv + av + kv + pv;

  // taxable income (annual) — subtract lump sums & a chunk of social contributions
  // (Vorsorgepauschale simplified): approximate deductible part of RV+KV+PV
  const vorsorge = (rv + kv + pv) * 12 * 0.8;
  let zvE =
    brutto * 12 -
    ARBEITNEHMER_PAUSCHBETRAG -
    SONDERAUSGABEN -
    vorsorge;

  // Steuerklasse adjustments (very rough):
  // 3 = doubled Grundfreibetrag-ish (favorable), 5 = none + higher, 2 = Entlastung
  if (input.steuerklasse === 3) zvE -= GRUNDFREIBETRAG; // approx splitting benefit
  if (input.steuerklasse === 2) zvE -= 4260; // Entlastungsbetrag Alleinerziehende
  if (input.steuerklasse === 5) zvE += GRUNDFREIBETRAG * 0.5;
  if (input.steuerklasse === 6) {
    // class 6: no Grundfreibetrag at all
    zvE = brutto * 12 - vorsorge;
  }
  zvE = Math.max(0, zvE);

  const lstYear = lohnsteuerYear(zvE);
  const lohnsteuer = lstYear / 12;

  // Soli: only above ~18130 EUR Lohnsteuer/year (most employees pay 0)
  const soliYear = lstYear > 18130 ? lstYear * 0.055 : 0;
  const soli = soliYear / 12;

  const kirchensteuer = input.kirchensteuer ? lohnsteuer * 0.09 : 0;

  const steuern = lohnsteuer + soli + kirchensteuer;
  const netto = brutto - sozialabgaben - steuern;

  return {
    brutto,
    netto: Math.max(0, netto),
    lohnsteuer,
    soli,
    kirchensteuer,
    rv,
    av,
    kv,
    pv,
    sozialabgaben,
    steuern,
  };
}

export function eur(n: number): string {
  return n.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export function eur2(n: number): string {
  return n.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
