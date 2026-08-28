import { NextResponse, type NextRequest } from "next/server"

const ACCESS_COOKIE = "omi_access"
const REFRESH_COOKIE = "omi_refresh"
const PORTAL_COOKIE = "omi_portal"

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/area-cliente")) {
    const publicPortalRoutes = ["/area-cliente/entrar", "/area-cliente/acesso"]
    const isPublic = publicPortalRoutes.includes(request.nextUrl.pathname)
    const hasPortalSession = request.cookies.has(PORTAL_COOKIE)
    if (!isPublic && !hasPortalSession) return NextResponse.redirect(new URL("/area-cliente/entrar", request.url))
    if (isPublic && hasPortalSession) return NextResponse.redirect(new URL("/area-cliente", request.url))
    return NextResponse.next()
  }
  const isLogin = request.nextUrl.pathname === "/dashboard/login"
  const hasSession =
    request.cookies.has(ACCESS_COOKIE) || request.cookies.has(REFRESH_COOKIE)

  if (!hasSession && !isLogin) {
    const loginUrl = new URL("/dashboard/login", request.url)
    loginUrl.searchParams.set("next", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  if (hasSession && isLogin) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ["/dashboard/:path*", "/area-cliente/:path*"] }
