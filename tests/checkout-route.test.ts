import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

vi.mock("server-only", () => ({}))
vi.mock("@/lib/server-auth", () => ({
  backendEndpoint: (path: string) => `https://backend.test${path}`,
  validateMutationOrigin: () => true,
}))
vi.mock("@/lib/portal-auth", () => ({ setPurchaseCookie: vi.fn() }))

import { POST } from "@/app/api/checkout/route"

function checkoutRequest(idempotencyKey?: string) {
  const headers = new Headers({
    "Content-Type": "application/json",
    Origin: "https://omi.test",
    "X-Vercel-Forwarded-For": "203.0.113.42",
  })
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey)
  return new NextRequest("https://omi.test/api/checkout", {
    method: "POST",
    headers,
    body: JSON.stringify({ offer: "assinatura", turnstile_token: "turnstile-token" }),
  })
}

describe("rota interna de checkout", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.CHECKOUT_CLIENT_IP_KEY = "checkout-internal-secret"
  })

  it("encaminha o Idempotency-Key ao backend", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({
      briefing_token: "briefing-token",
      resource_type: "subscription",
    }, { status: 201 }))

    const response = await POST(checkoutRequest("checkout-intent-123456789"))

    expect(response.status).toBe(201)
    const upstreamHeaders = new Headers(fetchMock.mock.calls[0][1]?.headers)
    expect(upstreamHeaders.get("Idempotency-Key")).toBe("checkout-intent-123456789")
    expect(upstreamHeaders.get("X-Checkout-Client-IP")).toBe("203.0.113.42")
    expect(upstreamHeaders.get("X-Checkout-Internal-Key")).toBe("checkout-internal-secret")
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toMatchObject({
      turnstile_token: "turnstile-token",
    })
  })

  it("rejeita a requisição sem chave antes de chamar o backend", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")

    const response = await POST(checkoutRequest())

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
