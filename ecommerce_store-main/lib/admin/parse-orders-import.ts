import type { CreateOrderInput, OrderStatus } from "@/lib/supabase/types";
import { csvToObjects } from "@/lib/admin/parse-csv";
import { ORDER_STATUSES } from "@/components/admin/order-status";

const STATUS_SET = new Set<string>(ORDER_STATUSES);

export type ParsedOrderRow = CreateOrderInput & {
  email?: string;
  rowNumber: number;
};

export type ParseOrdersResult =
  | { ok: true; rows: ParsedOrderRow[] }
  | { ok: false; errors: string[] };

function parseNumber(value: string, field: string, rowNumber: number): number | null {
  const cleaned = value.replace(/[^\d.-]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  if (!Number.isFinite(num)) {
    return null;
  }
  if (field === "total_price" && num < 0) return null;
  return num;
}

export function parseOrdersCsv(
  csvText: string,
  emailToUserId: Map<string, string>,
): ParseOrdersResult {
  const objects = csvToObjects(csvText);
  if (objects.length === 0) {
    return { ok: false, errors: ["File trống hoặc thiếu dòng tiêu đề (header)."] };
  }

  const rows: ParsedOrderRow[] = [];
  const errors: string[] = [];

  objects.forEach((obj, index) => {
    const rowNumber = index + 2;
    const email = (obj.email ?? obj.khach_hang ?? "").toLowerCase().trim();
    const totalRaw = obj.total_price ?? obj.tong_tien ?? obj.total ?? "";
    const total_price = parseNumber(totalRaw, "total_price", rowNumber);

    if (total_price == null) {
      errors.push(`Dòng ${rowNumber}: thiếu hoặc sai total_price (tổng tiền).`);
      return;
    }

    let user_id: string | null = null;
    if (email) {
      user_id = emailToUserId.get(email) ?? null;
      if (!user_id) {
        errors.push(
          `Dòng ${rowNumber}: không tìm thấy user với email "${email}" trong public.users.`,
        );
        return;
      }
    }

    const subtotalRaw = obj.subtotal ?? obj.tam_tinh ?? "";
    const subtotal = subtotalRaw
      ? parseNumber(subtotalRaw, "subtotal", rowNumber)
      : total_price;

    const discountRaw = obj.discount_amount ?? obj.giam_gia ?? "";
    const discount_amount = discountRaw
      ? (parseNumber(discountRaw, "discount", rowNumber) ?? 0)
      : 0;

    const coupon_code = (obj.coupon_code ?? obj.ma_phieu ?? "").trim() || null;

    const statusRaw = (obj.status ?? obj.trang_thai ?? "pending").toLowerCase();
    const status = (
      STATUS_SET.has(statusRaw) ? statusRaw : "pending"
    ) as OrderStatus;

    rows.push({
      rowNumber,
      email: email || undefined,
      user_id,
      total_price,
      subtotal: subtotal ?? total_price,
      discount_amount,
      coupon_code,
      status,
    });
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (rows.length === 0) {
    return { ok: false, errors: ["Không có dòng dữ liệu hợp lệ."] };
  }

  return { ok: true, rows };
}
