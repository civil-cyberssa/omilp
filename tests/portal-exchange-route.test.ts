import { describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

vi.mock("server-only", () => ({}))
vi.mock("@/lib/server-auth", () => ({
  backendEndpoint: (path: string) => `https://backend.test${path}`,
  validateMutationOrigin: () => true,
}))
vi.mock("@/lib/portal-auth", () => ({ setPortalCookie: vi.fn() }))

import { POST } from "@/app/api/portal/access/exchange/route"

describe("troca do link de acesso", () => {
  it("substitui a mensagem técnica de rate limit", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({
      detail: "Pedido foi suprimido. Espera-se que esteja disponível em 2297 segundos.",
    }, { status: 429 }))
    const request = new NextRequest("https://omi.test/api/portal/access/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://omi.test" },
      body: JSON.stringify({ token: "magic-token" }),
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(429)
    expect(payload.error.details.message).toBe("Não foi possível validar este link agora. Solicite um novo link de acesso.")
    expect(JSON.stringify(payload)).not.toContain("2297")
  })
})
