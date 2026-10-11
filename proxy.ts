import type { NextAuthRequest } from "next-auth"
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server"

import { auth } from "@/auth"
import { PORTAL_COOKIE } from "@/lib/auth-config"
import { buildContentSecurityPolicy } from "@/lib/security-headers.mjs"

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
const production = process.env.NODE_ENV === "production"

function securedNext(requestHeaders: Headers) {
  return NextResponse.next({ request: { headers: requestHeaders } })
}

function portalResponse(request: NextRequest, requestHeaders: Headers) {
  if (request.nextUrl.pathname.startsWith("/area-cliente")) {
    const publicPortalRoutes = ["/area-cliente/entrar", "/area-cliente/acesso"]
    const isPublic = publicPortalRoutes.includes(request.nextUrl.pathname)
    const hasPortalSession = request.cookies.has(PORTAL_COOKIE)
    if (!isPublic && !hasPortalSession) return NextResponse.redirect(new URL("/area-cliente/entrar", request.url))
    if (isPublic && hasPortalSession) return NextResponse.redirect(new URL("/area-cliente", request.url))
    return securedNext(requestHeaders)
  }
}

const authenticatedProxy = auth((request: NextAuthRequest, _event: NextFetchEvent) => {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const contentSecurityPolicy = buildContentSecurityPolicy(apiUrl, production, nonce)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy)

  const portal = portalResponse(request, requestHeaders)
  if (portal) {
    portal.headers.set("Content-Security-Policy", contentSecurityPolicy)
    return portal
  }

  let response: NextResponse
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const isLogin = request.nextUrl.pathname === "/dashboard/login"
    const hasSession = Boolean(request.auth?.user) && request.auth?.error !== "RefreshTokenError"

    if (!hasSession && !isLogin) {
      const loginUrl = new URL("/dashboard/login", request.url)
      loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`)
      response = NextResponse.redirect(loginUrl)
    } else if (hasSession && isLogin) {
      response = NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      response = securedNext(requestHeaders)
    }
  } else {
    response = securedNext(requestHeaders)
  }

  response.headers.set("Content-Security-Policy", contentSecurityPolicy)
  return response
})

export function proxy(request: NextRequest, event: NextFetchEvent) {
  return authenticatedProxy(request, event)
}

export const config = {
  matcher: [{ source: "/((?!api|_next/static|_next/image|favicon.ico).*)" }],
}
