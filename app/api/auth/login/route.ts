import { type NextRequest, NextResponse } from "next/server"

import { apiError, readUpstreamJson, withRouteErrorHandling } from "@/lib/api-response"
import { backendEndpoint, setAuthCookies, validateMutationOrigin } from "@/lib/server-auth"

export async function POST(request: NextRequest) {
  return withRouteErrorHandling("POST /api/auth/login", async () => {
    if (!validateMutationOrigin(request)) return apiError(403, "INVALID_ORIGIN", { message: "Origem inválida." })
    const credentials = await request.json()
    const backendResponse = await fetch(backendEndpoint("/api/auth/token/"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials), cache: "no-store",
    })
    if (!backendResponse.ok) return apiError(backendResponse.status, "INVALID_CREDENTIALS", { message: "E-mail ou senha inválidos." })
    const parsed = await readUpstreamJson<{ access: string; refresh: string }>(backendResponse)
    if (parsed.error) return parsed.error
    const response = NextResponse.json({ authenticated: true })
    setAuthCookies(response, parsed.data)
    return response
  })
}
