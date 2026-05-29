import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dat-lai-mat-khau";
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/dat-lai-mat-khau";
  const loginPath = safeNext.startsWith("/login") ? "/login" : "/dang-nhap";

  if (code) {
    try {
      const supabase = await createAuthServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        const loginUrl = new URL(loginPath, url.origin);
        loginUrl.searchParams.set("error", "reset_link_invalid");
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL(loginPath, url.origin);
      loginUrl.searchParams.set("error", "reset_link_invalid");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(new URL(safeNext, url.origin));
}
