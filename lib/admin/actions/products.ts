"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { guardAdmin, withAdminAction } from "@/lib/admin/auth";
import * as products from "@/lib/admin/data/products";
import { STORE_PRODUCTS_TAG } from "@/lib/store/catalog";
import { logAdminAuditAndNotification } from "@/lib/admin/audit/log";
import type {
  CreateProductInput,
  ProductStatus,
  UpdateProductInput,
} from "@/lib/supabase/types";

const ADMIN_PATH = "/admin";

const STORE_CATEGORY_PATHS = [
  "/sneakers",
  "/sunglasses",
  "/clothing",
  "/bags",
  "/watches",
  "/search",
] as const;

function revalidateProducts() {
  revalidatePath(ADMIN_PATH);
  revalidateTag(STORE_PRODUCTS_TAG, "max");
  for (const path of STORE_CATEGORY_PATHS) {
    revalidatePath(path);
  }
  revalidatePath("/products", "layout");
}

export async function getProductsAction() {
  return withAdminAction(() => products.listProducts());
}

export async function getProductAction(id: string) {
  return withAdminAction(() => products.getProduct(id));
}

export async function createProductAction(input: CreateProductInput) {
  return withAdminAction(async () => {
    const result = await products.createProduct(input);
    if (result.ok) {
      revalidateProducts();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "product_created",
            entityType: "product",
            entityId: result.data.id,
            diff: { input },
          },
          {
            type: "admin_action",
            title: "Admin cập nhật sản phẩm",
            body: `Tạo sản phẩm ${result.data.name}`,
            entityType: "product",
            entityId: result.data.id,
          },
        );
      }
    }
    return result;
  });
}

export async function updateProductAction(
  id: string,
  input: UpdateProductInput,
) {
  return withAdminAction(async () => {
    const result = await products.updateProduct(id, input);
    if (result.ok) {
      revalidateProducts();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "product_updated",
            entityType: "product",
            entityId: id,
            diff: { input },
          },
          {
            type: "admin_action",
            title: "Admin cập nhật sản phẩm",
            body: `Cập nhật sản phẩm ${result.data.name}`,
            entityType: "product",
            entityId: id,
          },
        );
      }
    }
    return result;
  });
}

export async function deleteProductAction(id: string) {
  return withAdminAction(async () => {
    const result = await products.deleteProduct(id);
    if (result.ok) {
      revalidateProducts();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "product_deleted",
            entityType: "product",
            entityId: id,
            diff: { id },
          },
          {
            type: "admin_action",
            title: "Admin xóa sản phẩm",
            body: `Xóa sản phẩm ${id}`,
            entityType: "product",
            entityId: id,
          },
        );
      }
    }
    return result;
  });
}

export async function deleteProductsBulkAction(ids: string[]) {
  return withAdminAction(async () => {
    const result = await products.deleteProducts(ids);
    if (result.ok) {
      revalidateProducts();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "products_bulk_deleted",
            entityType: "product",
            entityId: result.data.ids[0] ?? "bulk",
            diff: { ids: result.data.ids, count: result.data.count },
          },
          {
            type: "admin_action",
            title: "Admin xóa sản phẩm hàng loạt",
            body: `Xóa ${result.data.count} sản phẩm`,
            entityType: "product",
            entityId: result.data.ids[0] ?? "bulk",
          },
        );
      }
    }
    return result;
  });
}

export async function updateProductsStatusBulkAction(
  ids: string[],
  status: ProductStatus,
) {
  return withAdminAction(async () => {
    const result = await products.updateProductStatus(ids, status);
    if (result.ok) {
      revalidateProducts();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "products_bulk_status_updated",
            entityType: "product",
            entityId: result.data.ids[0] ?? "bulk",
            diff: { ids: result.data.ids, count: result.data.count, status },
          },
          {
            type: "admin_action",
            title: "Admin cập nhật trạng thái sản phẩm hàng loạt",
            body: `Cập nhật ${result.data.count} sản phẩm → ${status}`,
            entityType: "product",
            entityId: result.data.ids[0] ?? "bulk",
          },
        );
      }
    }
    return result;
  });
}
