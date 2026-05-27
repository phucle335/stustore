"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Download, FileUp } from "lucide-react";
import { importOrdersAction } from "@/lib/admin/actions/orders";
import { parseOrdersCsv } from "@/lib/admin/parse-orders-import";
import { ORDER_STATUS_LABELS } from "@/components/admin/order-status";
import { formatCurrency } from "@/components/admin/format";
import type { DbOrder, DbUser } from "@/lib/supabase/types";

const TEMPLATE_URL = "/templates/orders-import-template.csv";

type OrderImportPanelProps = {
  customers: DbUser[];
  onImported: (orders: DbOrder[]) => void;
};

export function OrderImportPanel({
  customers,
  onImported,
}: OrderImportPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [csvText, setCsvText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const emailToUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const customer of customers) {
      map.set(customer.email.toLowerCase(), customer.id);
    }
    return map;
  }, [customers]);

  const preview = useMemo(() => {
    if (!csvText) return null;
    const result = parseOrdersCsv(csvText, emailToUserId);
    if (!result.ok) {
      return { ok: false as const, errors: result.errors };
    }
    return { ok: true as const, rows: result.rows };
  }, [csvText, emailToUserId]);

  function handleFileChange(file: File | null) {
    setImportError(null);
    setImportMessage(null);
    setPreviewError(null);

    if (!file) {
      setCsvText(null);
      setFileName(null);
      return;
    }

    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".csv")) {
      setPreviewError("Chỉ hỗ trợ file .csv (xuất từ Excel: Save As CSV).");
      setCsvText(null);
      setFileName(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setCsvText(text);
      setFileName(file.name);
    };
    reader.onerror = () => {
      setPreviewError("Không đọc được file.");
      setCsvText(null);
      setFileName(null);
    };
    reader.readAsText(file, "UTF-8");
  }

  function handleImport() {
    if (!csvText) {
      setImportError("Chọn file CSV trước.");
      return;
    }
    if (preview && !preview.ok) {
      setImportError(preview.errors.join("\n"));
      return;
    }

    startTransition(async () => {
      setImportError(null);
      setImportMessage(null);

      const result = await importOrdersAction(csvText);
      if (!result.ok) {
        setImportError(result.error);
        return;
      }

      onImported(result.data.orders);
      setImportMessage(`Đã import ${result.data.count} đơn hàng.`);
      setCsvText(null);
      setFileName(null);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <section className="admin-card mb-6 border-dashed">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold admin-text">Import đơn hàng từ CSV</h3>
          <p className="mt-1 max-w-xl text-xs admin-muted">
            Cột: email, total_price, subtotal, discount_amount, coupon_code, status.
            Email trống = khách lẻ. Email phải có trong bảng users.
          </p>
        </div>
        <a
          href={TEMPLATE_URL}
          download="orders-import-template.csv"
          className="admin-btn inline-flex items-center gap-1.5 text-xs"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          Tải mẫu CSV
        </a>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="admin-btn admin-btn--primary inline-flex cursor-pointer items-center gap-2">
          <FileUp className="h-4 w-4" aria-hidden />
          Chọn file CSV
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
        </label>
        {fileName ? (
          <span className="text-xs admin-muted">{fileName}</span>
        ) : null}
        <button
          type="button"
          disabled={isPending || !csvText || (preview != null && !preview.ok)}
          onClick={handleImport}
          className="admin-btn admin-btn--primary disabled:opacity-50"
        >
          {isPending ? "Đang import…" : "Import vào Supabase"}
        </button>
      </div>

      {previewError ? (
        <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {previewError}
        </p>
      ) : null}

      {preview && !preview.ok ? (
        <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {preview.errors.join("\n")}
        </pre>
      ) : null}

      {preview?.ok && preview.rows.length > 0 ? (
        <div className="admin-table-wrap mt-4">
          <table className="admin-table text-xs">
            <thead>
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Tổng</th>
                <th className="px-3 py-2">Giảm</th>
                <th className="px-3 py-2">Mã</th>
                <th className="px-3 py-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((row) => (
                <tr key={row.rowNumber}>
                  <td className="px-3 py-2">{row.rowNumber}</td>
                  <td className="px-3 py-2">{row.email ?? "—"}</td>
                  <td className="px-3 py-2">{formatCurrency(row.total_price)}</td>
                  <td className="px-3 py-2">
                    {formatCurrency(row.discount_amount ?? 0)}
                  </td>
                  <td className="px-3 py-2">{row.coupon_code ?? "—"}</td>
                  <td className="px-3 py-2">
                    {ORDER_STATUS_LABELS[row.status ?? "pending"]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-[var(--admin-border)] px-3 py-2 text-[11px] admin-muted">
            Xem trước {preview.rows.length} dòng — bấm Import để ghi vào database.
          </p>
        </div>
      ) : null}

      {importError ? (
        <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {importError}
        </pre>
      ) : null}
      {importMessage ? (
        <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          {importMessage}
        </p>
      ) : null}
    </section>
  );
}
