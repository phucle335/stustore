import { withAdminApi } from "@/lib/admin/api";
import { failure, success } from "@/lib/admin/result";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  return withAdminApi(async () => {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return failure("Missing image file.");
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return failure("Only JPEG, PNG, WebP or GIF accepted.");
    }

    if (file.size > MAX_BYTES) {
      return failure("Image max 5MB.");
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
      ? ext
      : "jpg";
    const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`;

    const supabase = createAdminSupabaseClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return failure(
        uploadError.message.includes("Bucket not found")
          ? "product-images bucket not created. Run supabase/product-images-storage.sql in SQL Editor."
          : uploadError.message,
      );
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return success({ url: data.publicUrl, path });
  });
}
