import { NextResponse, type NextRequest } from "next/server";

/**
 * Retired pages from the first version of the app (email login, dashboard, 21-day programs) and the
 * old /train product picker. Training now opens only from the home page with an order number, so
 * all of these go home.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/train",
    "/login/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/dashboard/:path*",
    "/programs/:path*",
    "/session/:path*",
    "/progress/:path*",
    "/calendar/:path*",
    "/library/:path*",
    "/settings/:path*",
    "/exercises/:path*",
    "/assets/onboarding/:path*",
  ],
};
