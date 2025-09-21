import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const pid = req.cookies.get("profile_id")?.value
  const whitelist = ["/profiles", "/api"] // no interceptar estas rutas

  if (!pid && !whitelist.some(p => url.pathname.startsWith(p))) {
    const to = new URL("/profiles", url)
    return NextResponse.redirect(to)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
}
