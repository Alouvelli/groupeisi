import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session-token";

const AUTH_SECRET = process.env.AUTH_SECRET ?? "dev-secret-change-me-please-32-chars-min";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/admin/login";
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token, AUTH_SECRET) : null;

  if (pathname.startsWith("/admin")) {
    if (!session && !isLogin) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (session && isLogin) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }
  if (pathname.startsWith("/api/admin") && !session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
