import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { apiError, readUpstreamJson, withRouteErrorHandling } from "@/lib/api-response"
import { setPortalCookie } from "@/lib/portal-auth"
import { backendEndpoint, validateMutationOrigin } from "@/lib/server-auth"

export async function POST(request: NextRequest) {
  return withRouteErrorHandling("POST /api/portal/access/exchange", async () => {
    if (!validateMutationOrigin(request)) return apiError(403, "INVALID_ORIGIN", { message: "Origem inválida." })
    const backend = await fetch(backendEndpoint("/api/v1/portal/access/exchange/"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()), cache: "no-store",
    })
    if (backend.status === 429) {
      return apiError(429, "PORTAL_ACCESS_RATE_LIMITED", { message: "Não foi possível validar este link agora. Solicite um novo link de acesso." })
    }
    const parsed = await readUpstreamJson<{ session?: string }>(backend)
    if (parsed.error) return parsed.error
    if (!parsed.data.session) return apiError(502, "INVALID_UPSTREAM_RESPONSE", { message: "O backend não retornou uma sessão válida." })
    const response = NextResponse.json({ authenticated: true })
    setPortalCookie(response, parsed.data.session)
    return response
  })
}
