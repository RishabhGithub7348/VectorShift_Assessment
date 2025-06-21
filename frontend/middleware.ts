import { NextResponse, type NextRequest } from "next/server";

export const middleware = (request: NextRequest) => {
  // Redirect root path to dashboard
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Allow other paths to continue
  return NextResponse.next();
};

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|404|favicon.ico).*)",
  ],
};