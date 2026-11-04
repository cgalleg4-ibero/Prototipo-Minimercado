import { getIronSession } from "iron-session";
import { NextRequest, NextResponse } from "next/server";
import { SessionData, sessionOptions } from "@/lib/session-options";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions,
  );
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (session.role !== "admin" || !session.userId) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/pos")) {
    if (!session.userId || !session.role) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/pos/:path*"],
};
