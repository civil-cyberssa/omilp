import "server-only"

import { encode, getToken, type JWT } from "next-auth/jwt"
import type { NextRequest } from "next/server"

import { apiError, proxyUpstreamResponse } from "@/lib/api-response"
import {
  AUTH_SESSION_COOKIE,
  AUTH_SESSION_MAX_AGE,
  getAuthSecret,
} from "@/lib/auth-config"
import {
  accessTokenExpiresAt,
  backendEndpoint,
  refreshBackendTokens,
} from "@/lib/backend-auth"

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: AUTH_SESSION_MAX_AGE,
}

export { backendEndpoint }

export function validateMutationOrigin(request: NextRequest) {
  const origin = request.headers.get("origin")
  if (!origin) return false
  const configuredSite = process.env.NEXT_PUBLIC_SITE_URL
  if (configuredSite) {
    try {
      return new URL(origin).origin === new URL(configuredSite).origin
    } catch {
      return false
    }
  }
  if (process.env.NODE_ENV === "production") return false
  try {
    return new URL(origin).origin === request.nextUrl.origin
  } catch {
    return false
  }
}

async function readAuthToken(request: NextRequest) {
  const secret = getAuthSecret()
  if (!secret) return null
  return getToken({ req: request, secret, cookieName: AUTH_SESSION_COOKIE })
}

async function refreshedAuthToken(token: JWT) {
  if (!token.backendRefreshToken) return null
  const tokens = await refreshBackendTokens(token.backendRefreshToken)
  if (!tokens) return null
  return {
    ...token,
    backendAccessToken: tokens.access,
    backendRefreshToken: tokens.refresh ?? token.backendRefreshToken,
    backendAccessTokenExpiresAt: accessTokenExpiresAt(tokens.access),
    error: undefined,
  } satisfies JWT
}

type AuthenticatedRequestResult = {
  response: Response
  authToken?: JWT
  clearSession?: boolean
}

export async function authenticatedBackendRequest(
  request: NextRequest,
  path: string,
  init: RequestInit = {},
): Promise<AuthenticatedRequestResult> {
  try {
    let token = await readAuthToken(request)
    if (!token?.backendAccessToken) {
      return {
        response: apiError(401, "SESSION_EXPIRED", { message: "Sessão expirada." }),
        clearSession: true,
      }
    }

    if (
      token.backendAccessTokenExpiresAt &&
      Date.now() >= token.backendAccessTokenExpiresAt - 30_000
    ) {
      const refreshed = await refreshedAuthToken(token)
      if (!refreshed) {
        return {
          response: apiError(401, "SESSION_EXPIRED", { message: "Sessão expirada." }),
          clearSession: true,
        }
      }
      token = refreshed
    }

    const headers = new Headers(init.headers)
    headers.set("Authorization", `Bearer ${token.backendAccessToken}`)

    let response = await fetch(backendEndpoint(path), { ...init, headers, cache: "no-store" })
    if (response.status !== 401) return { response, authToken: token }

    const refreshed = await refreshedAuthToken(token)
    if (!refreshed) return { response, clearSession: true }

    headers.set("Authorization", `Bearer ${refreshed.backendAccessToken}`)
    response = await fetch(backendEndpoint(path), { ...init, headers, cache: "no-store" })
    return { response, authToken: refreshed, clearSession: response.status === 401 }
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
  const secret = getAuthSecret()
  if (result.authToken && secret) {
    const value = await encode({
      token: result.authToken,
      secret,
      salt: AUTH_SESSION_COOKIE,
      maxAge: AUTH_SESSION_MAX_AGE,
    })
    response.cookies.set(AUTH_SESSION_COOKIE, value, authCookieOptions)
  }
  if (result.clearSession) {
    response.cookies.set(AUTH_SESSION_COOKIE, "", { ...authCookieOptions, maxAge: 0 })
  }
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
