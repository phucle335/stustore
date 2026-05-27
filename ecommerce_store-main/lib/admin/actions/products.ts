"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { withAdminAction } from "@/lib/admin/auth";
import * as products from "@/lib/admin/data/products";
import { STORE_PRODUCTS_TAG } from "@/lib/store/catalog";
import type {
  CreateProductInput,
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
    if (result.ok) revalidateProducts();
    return result;
  });
}

export async function updateProductAction(
  id: string,
  input: UpdateProductInput,
) {
  return withAdminAction(async () => {
    const result = await products.updateProduct(id, input);
    if (result.ok) revalidateProducts();
    return result;
  });
}

export async function deleteProductAction(id: string) {
  return withAdminAction(async () => {
    const result = await products.deleteProduct(id);
    if (result.ok) revalidateProducts();
    return result;
  });
}
