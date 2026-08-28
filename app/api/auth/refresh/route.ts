import { type NextRequest, NextResponse } from "next/server"

import { apiError, readUpstreamJson, withRouteErrorHandling } from "@/lib/api-response"
import {
  backendEndpoint,
  clearAuthCookies,
  REFRESH_COOKIE,
  setAuthCookies,
  validateMutationOrigin,
} from "@/lib/server-auth"

export async function POST(request: NextRequest) {
  return withRouteErrorHandling("POST /api/auth/refresh", async () => {
    if (!validateMutationOrigin(request)) return apiError(403, "INVALID_ORIGIN", { message: "Origem inválida." })
    const refresh = request.cookies.get(REFRESH_COOKIE)?.value
    if (!refresh) return apiError(401, "SESSION_EXPIRED", { message: "Sessão expirada." })
    const backendResponse = await fetch(backendEndpoint("/api/auth/token/refresh/"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }), cache: "no-store",
    })
    if (!backendResponse.ok) {
      const response = apiError(401, "SESSION_EXPIRED", { message: "Sessão expirada." })
      clearAuthCookies(response)
      return response
    }
    const parsed = await readUpstreamJson<{ access: string; refresh?: string }>(backendResponse)
    if (parsed.error) return parsed.error
    const response = NextResponse.json({ refreshed: true })
    setAuthCookies(response, parsed.data)
    return response
  })
}
