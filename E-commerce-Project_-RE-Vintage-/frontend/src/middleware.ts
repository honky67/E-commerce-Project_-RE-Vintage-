import { NextResponse, type NextRequest } from "next/server";

// Guests can browse "/" and "/shops"; opening a store or any dashboard sends them to login.
export function middleware(req: NextRequest) {
  if (req.cookies.get("rv_auth")) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/vendor/:path*", "/dashboard/:path*", "/admin/:path*"] };
