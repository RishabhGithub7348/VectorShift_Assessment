import { NextResponse, type NextRequest } from "next/server";

export const middleware = (request: NextRequest) => {
  // Just return next() response for the root path
  if (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/users") {
    return NextResponse.next();
  }
};

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|404|favicon.ico).*)",
  ],
};