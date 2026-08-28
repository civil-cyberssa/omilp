import type { NextAuthRequest } from "next-auth"
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server"

import { auth } from "@/auth"
import { PORTAL_COOKIE } from "@/lib/auth-config"

function portalResponse(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/area-cliente")) {
    const publicPortalRoutes = ["/area-cliente/entrar", "/area-cliente/acesso"]
    const isPublic = publicPortalRoutes.includes(request.nextUrl.pathname)
    const hasPortalSession = request.cookies.has(PORTAL_COOKIE)
    if (!isPublic && !hasPortalSession) return NextResponse.redirect(new URL("/area-cliente/entrar", request.url))
    if (isPublic && hasPortalSession) return NextResponse.redirect(new URL("/area-cliente", request.url))
    return NextResponse.next()
  }
}

const authenticatedProxy = auth((request: NextAuthRequest, _event: NextFetchEvent) => {
  const portal = portalResponse(request)
  if (portal) return portal

  const isLogin = request.nextUrl.pathname === "/dashboard/login"
  const hasSession = Boolean(request.auth?.user) && request.auth?.error !== "RefreshTokenError"

  if (!hasSession && !isLogin) {
    const loginUrl = new URL("/dashboard/login", request.url)
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }
  if (hasSession && isLogin) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
  return NextResponse.next()
})

export function proxy(request: NextRequest, event: NextFetchEvent) {
  return authenticatedProxy(request, event)
}

export const config = { matcher: ["/dashboard/:path*", "/area-cliente/:path*"] }
