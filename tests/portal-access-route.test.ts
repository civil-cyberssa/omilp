import { afterEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const { sendPortalAccessEmail } = vi.hoisted(() => ({ sendPortalAccessEmail: vi.fn() }))

vi.mock("server-only", () => ({}))
vi.mock("@/lib/contact-email-service", () => ({ sendPortalAccessEmail }))
vi.mock("@/lib/server-auth", () => ({
  backendEndpoint: (path: string) => `https://backend.test${path}`,
  validateMutationOrigin: () => true,
}))

import { POST } from "@/app/api/portal/access/request/route"

afterEach(() => {
  vi.restoreAllMocks()
  delete process.env.PORTAL_ACCESS_KEY
  delete process.env.PORTAL_INTERNAL_KEY
})

describe("solicitação de acesso ao portal", () => {
  it("encaminha a chave canônica PORTAL_ACCESS_KEY", async () => {
    process.env.PORTAL_ACCESS_KEY = "portal-access-test-key"
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ found: false }))
    const request = new NextRequest("https://omi.test/api/portal/access/request", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://omi.test" },
      body: JSON.stringify({ email: "cliente@example.com" }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers)
    expect(headers.get("X-Portal-Internal-Key")).toBe("portal-access-test-key")
  })

  it("falha claramente quando nenhuma chave está configurada", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
    const request = new NextRequest("https://omi.test/api/portal/access/request", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://omi.test" },
      body: JSON.stringify({ email: "cliente@example.com" }),
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("não expõe mensagens técnicas de rate limit", async () => {
    process.env.PORTAL_ACCESS_KEY = "portal-access-test-key"
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({
      detail: "Pedido foi suprimido. Espera-se que esteja disponível em 2297 segundos.",
    }, { status: 429 }))
    const request = new NextRequest("https://omi.test/api/portal/access/request", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://omi.test" },
      body: JSON.stringify({ email: "cliente@example.com" }),
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.detail).toBe("Se o e-mail estiver cadastrado, você receberá o link de acesso.")
    expect(JSON.stringify(payload)).not.toContain("2297")
  })
})
