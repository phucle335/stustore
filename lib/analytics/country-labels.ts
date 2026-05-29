const COUNTRY_NAMES: Record<string, string> = {
  VN: "Việt Nam",
  US: "Hoa Kỳ",
  SG: "Singapore",
  TH: "Thái Lan",
  JP: "Nhật Bản",
  KR: "Hàn Quốc",
  CN: "Trung Quốc",
  TW: "Đài Loan",
  HK: "Hồng Kông",
  MY: "Malaysia",
  ID: "Indonesia",
  PH: "Philippines",
  AU: "Úc",
  GB: "Anh",
  FR: "Pháp",
  DE: "Đức",
  CA: "Canada",
  IN: "Ấn Độ",
};

export function countryLabel(code: string | null | undefined): string {
  if (!code) return "Không xác định";
  const upper = code.trim().toUpperCase();
  return COUNTRY_NAMES[upper] ?? upper;
}
