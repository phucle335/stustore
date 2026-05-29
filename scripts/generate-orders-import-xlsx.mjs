/**
 * Generates supabase/orders-import-template.xlsx
 * Run: npm run generate:orders-xlsx
 */
import * as XLSX from "xlsx";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const csvPath = join(__dirname, "..", "supabase", "orders-import-template.csv");
const outPath = join(__dirname, "..", "supabase", "orders-import-template.xlsx");

const csv = readFileSync(csvPath, "utf8");
const lines = csv.trim().split(/\r?\n/);
const headers = lines[0].split(",");
const rows = lines.slice(1).map((line) => {
  const cells = line.split(",");
  const obj = {};
  headers.forEach((h, i) => {
    obj[h] = cells[i] ?? "";
  });
  return obj;
});

const guideRows = [
  ["HƯỚNG DẪN IMPORT ĐƠN HÀNG"],
  [""],
  ["Cột", "Mô tả"],
  ["email", "Email khách trong public.users — để trống = khách lẻ"],
  ["total_price", "Tổng thanh toán (VND, số)"],
  ["subtotal", "Tạm tính trước giảm — mặc định = total_price"],
  ["discount_amount", "Số tiền giảm (mặc định 0)"],
  ["coupon_code", "Mã phiếu (tùy chọn)"],
  ["status", "pending | confirmed | processing | shipped | delivered | cancelled"],
  [""],
  ["Cách dùng trong Admin"],
  ["1", "Admin → Đơn hàng → Tải mẫu CSV hoặc xuất sheet orders sang CSV"],
  ["2", "Chọn file → xem trước → Import vào Supabase"],
  [""],
  ["Lưu ý", "Email phải tồn tại trong users; không import cột id"],
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows, { header: headers }), "orders");
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(guideRows), "huong_dan");
XLSX.writeFile(wb, outPath);
console.log("Created:", outPath);
