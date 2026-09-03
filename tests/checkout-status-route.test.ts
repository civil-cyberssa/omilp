import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

vi.mock("server-only", () => ({}))
vi.mock("@/lib/server-auth", () => ({
  backendEndpoint: (path: string) => `https://backend.test${path}`,
}))
vi.mock("@/lib/portal-auth", () => ({
  PURCHASE_COOKIE: "omi_purchase",
  passThrough: (response: Response) => response,
}))

import { GET } from "@/app/api/checkout/status/route"

describe("consulta pública do status do checkout", () => {
  beforeEach(() => vi.restoreAllMocks())

  it("encaminha somente o token opaco da compra, sem chave interna", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({
      resource_type: "order",
      status: "PAID",
      payment_status: "RECEIVED",
      confirmed: true,
    }))
    const request = {
      cookies: {
        get: () => ({ value: "550e8400-e29b-41d4-a716-446655440000" }),
      },
    } as unknown as NextRequest

    const response = await GET(request)

    expect(response.status).toBe(200)
    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers)
    expect(headers.get("X-Purchase-Token")).toBe("550e8400-e29b-41d4-a716-446655440000")
    expect(headers.has("X-Checkout-Internal-Key")).toBe(false)
  })

  it("não consulta o backend quando não existe uma sessão de compra", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
    const request = new NextRequest("https://omi.test/api/checkout/status")

    const response = await GET(request)

    expect(response.status).toBe(404)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
