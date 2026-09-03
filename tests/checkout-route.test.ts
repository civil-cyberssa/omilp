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
  })
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey)
  return new NextRequest("https://omi.test/api/checkout", {
    method: "POST",
    headers,
    body: JSON.stringify({ offer: "assinatura" }),
  })
}

describe("rota interna de checkout", () => {
  beforeEach(() => vi.restoreAllMocks())

  it("encaminha o Idempotency-Key ao backend", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({
      briefing_token: "briefing-token",
      resource_type: "subscription",
    }, { status: 201 }))

    const response = await POST(checkoutRequest("checkout-intent-123456789"))

    expect(response.status).toBe(201)
    const upstreamHeaders = new Headers(fetchMock.mock.calls[0][1]?.headers)
    expect(upstreamHeaders.get("Idempotency-Key")).toBe("checkout-intent-123456789")
  })

  it("rejeita a requisição sem chave antes de chamar o backend", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")

    const response = await POST(checkoutRequest())

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
