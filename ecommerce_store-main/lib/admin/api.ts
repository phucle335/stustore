import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin/auth";
import type { ActionResult } from "@/lib/admin/result";

function authStatus(error: string) {
  if (error.toLowerCase().includes("forbidden")) return 403;
  if (error.toLowerCase().includes("unauthorized")) return 401;
  return 400;
}

export function jsonResult<T>(result: ActionResult<T>, successStatus = 200) {
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: authStatus(result.error) },
    );
  }
  return NextResponse.json({ data: result.data }, { status: successStatus });
}

export async function withAdminApi<T>(
  handler: () => Promise<ActionResult<T>>,
  successStatus = 200,
) {
  const auth = await guardAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: authStatus(auth.error) });
  }
  return jsonResult(await handler(), successStatus);
}

export async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
