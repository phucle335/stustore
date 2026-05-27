import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { userIsAdmin } from "@/lib/admin/check-admin";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isMemberRoute =
    pathname === "/tai-khoan" || pathname.startsWith("/api/account/");

  if (isMemberRoute && !user) {
    if (pathname.startsWith("/api/account")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/dang-nhap", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isCheckoutRoute =
    pathname === "/checkout" ||
    pathname.startsWith("/api/store/checkout");

  if (isCheckoutRoute && !user) {
    if (pathname.startsWith("/api/store")) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để thanh toán." },
        { status: 401 },
      );
    }
    const loginUrl = new URL("/dang-nhap", request.url);
    loginUrl.searchParams.set("redirect", "/checkout");
    return NextResponse.redirect(loginUrl);
  }

  const isAdminRoute =
    pathname.startsWith("/api/admin") || pathname.startsWith("/admin");

  if (isAdminRoute) {
    if (!user) {
      if (request.nextUrl.pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isAdmin = await userIsAdmin(supabase, user);

    if (!isAdmin) {
      if (request.nextUrl.pathname.startsWith("/api/admin")) {
        return NextResponse.json(
          { error: "Forbidden: admin role required" },
          { status: 403 },
        );
      }
      const forbiddenUrl = new URL("/khong-co-quyen", request.url);
      forbiddenUrl.searchParams.set("from", "admin");
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return supabaseResponse;
}
