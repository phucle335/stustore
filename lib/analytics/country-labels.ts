const COUNTRY_NAMES: Record<string, string> = {
  VN: "Vietnam",
  US: "United States",
  SG: "Singapore",
  TH: "Thailand",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  TW: "Taiwan",
  HK: "Hong Kong",
  MY: "Malaysia",
  ID: "Indonesia",
  PH: "Philippines",
  AU: "Australia",
  GB: "United Kingdom",
  FR: "France",
  DE: "Germany",
  CA: "Canada",
  IN: "India",
};

export function countryLabel(code: string | null | undefined): string {
  if (!code) return "Unknown";
  const upper = code.trim().toUpperCase();
  return COUNTRY_NAMES[upper] ?? upper;
}
