import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { apiError, readUpstreamJson, withRouteErrorHandling } from "@/lib/api-response"
import { setPurchaseCookie } from "@/lib/portal-auth"
import { backendEndpoint, validateMutationOrigin } from "@/lib/server-auth"

export const maxDuration = 75

export async function POST(request: NextRequest) {
  return withRouteErrorHandling("POST /api/checkout", async () => {
    if (!validateMutationOrigin(request)) {
      return apiError(403, "INVALID_ORIGIN", { message: "Origem inválida." })
    }
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")?.trim()
    const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? ""
    if (idempotencyKey.length < 16 || idempotencyKey.length > 128 || /\s/.test(idempotencyKey)) {
      return apiError(400, "INVALID_IDEMPOTENCY_KEY", {
        message: "Informe um Idempotency-Key válido de 16 a 128 caracteres.",
      })
    }
    const headers = new Headers({ "Content-Type": "application/json" })
    headers.set("Idempotency-Key", idempotencyKey)
    if (clientIp) {
      headers.set("X-Checkout-Client-IP", clientIp)
      headers.set("X-Checkout-Internal-Key", process.env.CHECKOUT_CLIENT_IP_KEY ?? "")
    }
    const backend = await fetch(backendEndpoint("/api/v1/checkout/"), {
      method: "POST",
      headers,
      body: JSON.stringify(await request.json()),
      cache: "no-store",
    })
    const parsed = await readUpstreamJson<{
      briefing_token?: string
      public_token?: string
      [key: string]: unknown
    }>(backend)
    if (parsed.error) return parsed.error
    const { briefing_token: briefingToken, public_token: _publicToken, ...safePayload } = parsed.data
    if (!briefingToken) {
      return apiError(502, "INVALID_UPSTREAM_RESPONSE", {
        message: "O backend não retornou o token necessário para continuar a contratação.",
        upstream_status: backend.status,
      })
    }
    const response = NextResponse.json(safePayload, { status: backend.status })
    response.headers.set("Cache-Control", "no-store")
    setPurchaseCookie(response, briefingToken)
    return response
  })
}
