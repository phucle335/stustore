"use client";

import Image from "next/image";
import { ImagePlus, Link2, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import {
  PRODUCT_IMAGE_LABELS,
  PRODUCT_IMAGE_SLOTS,
} from "@/lib/admin/product-images";
import type { ProductImageFormState } from "@/lib/admin/product-images";

type ProductImageFieldsProps = {
  value: ProductImageFormState;
  onChange: (next: ProductImageFormState) => void;
  disabled?: boolean;
};

export function ProductImageFields({
  value,
  onChange,
  disabled = false,
}: ProductImageFieldsProps) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function setSlot(
    key: (typeof PRODUCT_IMAGE_SLOTS)[number],
    url: string,
  ) {
    onChange({ ...value, [key]: url });
  }

  async function handleFilePick(
    key: (typeof PRODUCT_IMAGE_SLOTS)[number],
    file: File | undefined,
  ) {
    if (!file) return;

    setUploadError(null);
    setUploadingSlot(key);

    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/admin/products/upload-image", {
        method: "POST",
        body,
      });
      const json = (await res.json()) as {
        data?: { url: string };
        error?: string;
      };

      if (!res.ok || !json.data?.url) {
        setUploadError(json.error ?? "Upload failed.");
        return;
      }

      setSlot(key, json.data.url);
    } catch {
      setUploadError("Could not upload image. Check your network or storage bucket.");
    } finally {
      setUploadingSlot(null);
      const input = fileRefs.current[key];
      if (input) input.value = "";
    }
  }

  return (
    <div className="admin-product-images">
      <div className="mb-2">
        <h3 className="text-sm font-semibold admin-text">Product Images</h3>
        <p className="text-xs admin-muted">
          Paste an image URL or select a file from your device (max 5 images, image 1 is the main).
        </p>
      </div>

      <div className="admin-product-images-grid">
        {PRODUCT_IMAGE_SLOTS.map((key, index) => {
          const url = (value[key] ?? "").trim();
          const busy = uploadingSlot === key;

          return (
            <div key={key} className="admin-image-slot">
              <label className="admin-image-slot-label">
                {PRODUCT_IMAGE_LABELS[index]}
              </label>

              <div className="admin-image-slot-preview">
                {url ? (
                  <>
                    <Image
                      src={url}
                      alt=""
                      width={120}
                      height={120}
                      className="admin-image-slot-img"
                      unoptimized
                    />
                    <button
                      type="button"
                      className="admin-image-slot-clear"
                      disabled={disabled || busy}
                      onClick={() => setSlot(key, "")}
                      aria-label="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <span className="admin-image-slot-empty">
                    <ImagePlus className="h-6 w-6" aria-hidden />
                  </span>
                )}
                {busy ? (
                  <span className="admin-image-slot-loading">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </span>
                ) : null}
              </div>

              <div className="admin-image-slot-url">
                <Link2 className="h-3.5 w-3.5 shrink-0 admin-muted" aria-hidden />
                <input
                  type="url"
                  value={value[key] ?? ""}
                  disabled={disabled || busy}
                  onChange={(e) => setSlot(key, e.target.value)}
                  placeholder="https://… or /images/…"
                  className="admin-input"
                />
              </div>

                <label className="admin-btn admin-image-upload-btn">
                {busy ? "Uploading…" : "Choose image from device"}
                <input
                  ref={(el) => {
                    fileRefs.current[key] = el;
                  }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  disabled={disabled || busy}
                  onChange={(e) =>
                    void handleFilePick(key, e.target.files?.[0])
                  }
                />
              </label>
            </div>
          );
        })}
      </div>

      {uploadError ? (
        <p className="mt-2 text-sm text-red-500">{uploadError}</p>
      ) : null}
    </div>
  );
}
