import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const role = (req.auth?.user as any)?.role;
    if (role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/notes", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
