import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["mn", "en"];
const defaultLocale = "mn";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1] ?? "";

  if (locales.includes(segment)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
