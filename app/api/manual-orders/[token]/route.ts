import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { apiError, readUpstreamJson, withRouteErrorHandling } from "@/lib/api-response"
import { checkoutSecurityHeaders } from "@/lib/checkout-security"
import { setPurchaseCookie } from "@/lib/portal-auth"
import { backendEndpoint, validateMutationOrigin } from "@/lib/server-auth"

type Context = { params: Promise<{ token: string }> }

function backendPath(token: string) {
  return `/api/v1/checkout/manual-orders/${encodeURIComponent(token)}/`
}

export async function GET(_request: NextRequest, { params }: Context) {
  return withRouteErrorHandling("GET /api/manual-orders/[token]", async () => {
    const { token } = await params
    const backend = await fetch(backendEndpoint(backendPath(token)), { cache: "no-store" })
    const parsed = await readUpstreamJson<{ briefing_token?: string | null; [key: string]: unknown }>(backend)
    if (parsed.error) return parsed.error
    const { briefing_token: briefingToken, ...safePayload } = parsed.data
    const response = NextResponse.json(safePayload, { status: backend.status })
    response.headers.set("Cache-Control", "no-store")
    if (briefingToken) setPurchaseCookie(response, briefingToken)
    return response
  })
}

export async function POST(request: NextRequest, { params }: Context) {
  return withRouteErrorHandling("POST /api/manual-orders/[token]", async () => {
    if (!validateMutationOrigin(request)) {
      return apiError(403, "INVALID_ORIGIN", { message: "Origem inválida." })
    }
    const { token } = await params
    const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? ""
    if (idempotencyKey.length < 16 || idempotencyKey.length > 128 || /\s/.test(idempotencyKey)) {
      return apiError(400, "INVALID_IDEMPOTENCY_KEY", { message: "Chave de pagamento inválida." })
    }
    const headers = new Headers({
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    })
    const securityHeaders = checkoutSecurityHeaders(request)
    if (!securityHeaders) {
      return apiError(503, "CHECKOUT_SECURITY_UNAVAILABLE", { message: "A proteção do checkout está indisponível." })
    }
    const payload = await request.json() as Record<string, unknown>
    const turnstileToken = typeof payload.turnstile_token === "string" ? payload.turnstile_token.trim() : ""
    if (!turnstileToken || turnstileToken.length > 2048) {
      return apiError(400, "TURNSTILE_REQUIRED", { message: "Confirme a verificação de segurança." })
    }
    headers.set("X-Checkout-Client-IP", securityHeaders["X-Checkout-Client-IP"])
    headers.set("X-Checkout-Internal-Key", securityHeaders["X-Checkout-Internal-Key"])
    const backend = await fetch(backendEndpoint(backendPath(token)), {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    })
    const parsed = await readUpstreamJson<{ briefing_token?: string; [key: string]: unknown }>(backend)
    if (parsed.error) return parsed.error
    const { briefing_token: briefingToken, ...safePayload } = parsed.data
    if (!briefingToken) return apiError(502, "INVALID_UPSTREAM_RESPONSE", { message: "A compra não retornou autorização para o briefing." })
    const response = NextResponse.json(safePayload, { status: backend.status })
    response.headers.set("Cache-Control", "no-store")
    setPurchaseCookie(response, briefingToken)
    return response
  })
}
