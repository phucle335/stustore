import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/account/require-user";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

export async function GET() {
  const auth = await requireAuthUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = await createAuthServerClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("product_id, created_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: (data ?? []).map((row) => row.product_id as string),
  });
}

type Body = { product_id?: string };

export async function POST(request: Request) {
  const auth = await requireAuthUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid data." }, { status: 400 });
  }

  const productId = body.product_id?.trim();
  if (!productId) {
    return NextResponse.json({ error: "Missing product_id." }, { status: 400 });
  }

  const supabase = await createAuthServerClient();
  const { error } = await supabase.from("favorites").upsert({
    user_id: auth.user.id,
    product_id: productId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await requireAuthUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("product_id")?.trim();
  if (!productId) {
    return NextResponse.json({ error: "Missing product_id." }, { status: 400 });
  }

  const supabase = await createAuthServerClient();
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", auth.user.id)
    .eq("product_id", productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
