import "server-only"

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { apiError, proxyUpstreamResponse } from "@/lib/api-response"

export const ACCESS_COOKIE = "omi_access"
export const REFRESH_COOKIE = "omi_refresh"

type TokenPair = { access: string; refresh?: string }

const backendUrl = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000"
).replace(/\/api\/v1\/?$/, "")

const accessCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 60,
}

const refreshCookieOptions = {
  ...accessCookieOptions,
  maxAge: 7 * 24 * 60 * 60,
}

export function backendEndpoint(path: string) {
  return `${backendUrl}${path.startsWith("/") ? path : `/${path}`}`
}

export function setAuthCookies(response: NextResponse, tokens: TokenPair) {
  response.cookies.set(ACCESS_COOKIE, tokens.access, accessCookieOptions)
  if (tokens.refresh) {
    response.cookies.set(REFRESH_COOKIE, tokens.refresh, refreshCookieOptions)
  }
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { ...accessCookieOptions, maxAge: 0 })
  response.cookies.set(REFRESH_COOKIE, "", { ...refreshCookieOptions, maxAge: 0 })
}

export function validateMutationOrigin(request: NextRequest) {
  const origin = request.headers.get("origin")
  if (!origin) return false
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  return origin === request.nextUrl.origin || origin === allowedOrigin
}

async function refreshAccessToken(refresh: string): Promise<TokenPair | null> {
  const response = await fetch(backendEndpoint("/api/auth/token/refresh/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
    cache: "no-store",
  })
  if (!response.ok) return null
  return response.json()
}

type AuthenticatedRequestResult = {
  response: Response
  tokens?: TokenPair
  clearSession?: boolean
}

export async function authenticatedBackendRequest(
  request: NextRequest,
  path: string,
  init: RequestInit = {},
): Promise<AuthenticatedRequestResult> {
  try {
    const access = request.cookies.get(ACCESS_COOKIE)?.value
    const refresh = request.cookies.get(REFRESH_COOKIE)?.value
    const headers = new Headers(init.headers)
    if (access) headers.set("Authorization", `Bearer ${access}`)

    let response = await fetch(backendEndpoint(path), { ...init, headers, cache: "no-store" })
    if (response.status !== 401) return { response }
    if (!refresh) return { response, clearSession: true }

    const tokens = await refreshAccessToken(refresh)
    if (!tokens) return { response, clearSession: true }

    headers.set("Authorization", `Bearer ${tokens.access}`)
    response = await fetch(backendEndpoint(path), { ...init, headers, cache: "no-store" })
    return { response, tokens, clearSession: response.status === 401 }
  } catch (cause) {
    console.error(`[backend] ${path}`, cause)
    return {
      response: apiError(502, "BACKEND_UNAVAILABLE", {
        message: "Não foi possível conectar ao serviço de backend.",
      }),
    }
  }
}

export async function toNextResponse(result: AuthenticatedRequestResult) {
  const response = await proxyUpstreamResponse(result.response)
  if (result.tokens) setAuthCookies(response, result.tokens)
  if (result.clearSession) clearAuthCookies(response)
  return response
}

export async function forwardRequestBody(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? ""
  if (contentType.includes("multipart/form-data")) {
    return { body: await request.formData() }
  }
  if (contentType.includes("application/json")) {
    return {
      body: JSON.stringify(await request.json()),
      headers: { "Content-Type": "application/json" },
    }
  }
  return { body: await request.text(), headers: { "Content-Type": contentType } }
}
