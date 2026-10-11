import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { apiError, readUpstreamJson, withRouteErrorHandling } from "@/lib/api-response"
import { checkoutSecurityHeaders } from "@/lib/checkout-security"
import { setPurchaseCookie } from "@/lib/portal-auth"
import { backendEndpoint, validateMutationOrigin } from "@/lib/server-auth"

export const maxDuration = 75

export async function POST(request: NextRequest) {
  return withRouteErrorHandling("POST /api/checkout", async () => {
    if (!validateMutationOrigin(request)) {
      return apiError(403, "INVALID_ORIGIN", { message: "Origem inválida." })
    }
    const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? ""
    if (idempotencyKey.length < 16 || idempotencyKey.length > 128 || /\s/.test(idempotencyKey)) {
      return apiError(400, "INVALID_IDEMPOTENCY_KEY", {
        message: "Informe um Idempotency-Key válido de 16 a 128 caracteres.",
      })
    }
    const securityHeaders = checkoutSecurityHeaders(request)
    if (!securityHeaders) {
      return apiError(503, "CHECKOUT_SECURITY_UNAVAILABLE", { message: "A proteção do checkout está indisponível." })
    }
    const payload = await request.json() as Record<string, unknown>
    const turnstileToken = typeof payload.turnstile_token === "string" ? payload.turnstile_token.trim() : ""
    if (!turnstileToken || turnstileToken.length > 2048) {
      return apiError(400, "TURNSTILE_REQUIRED", { message: "Confirme a verificação de segurança." })
    }
    const headers = new Headers({ "Content-Type": "application/json" })
    headers.set("Idempotency-Key", idempotencyKey)
    headers.set("X-Checkout-Client-IP", securityHeaders["X-Checkout-Client-IP"])
    headers.set("X-Checkout-Internal-Key", securityHeaders["X-Checkout-Internal-Key"])
    const backend = await fetch(backendEndpoint("/api/v1/checkout/"), {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
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
