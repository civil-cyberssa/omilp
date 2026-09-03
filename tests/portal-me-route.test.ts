import { describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const { clearPortalCookie, portalBackendRequest } = vi.hoisted(() => ({
  clearPortalCookie: vi.fn(),
  portalBackendRequest: vi.fn(),
}))

vi.mock("server-only", () => ({}))
vi.mock("@/lib/portal-auth", () => ({
  clearPortalCookie,
  passThrough: (response: Response) => response,
  portalBackendRequest,
}))
vi.mock("@/lib/server-auth", () => ({ validateMutationOrigin: () => true }))

import { GET, PATCH } from "@/app/api/portal/me/route"

describe("sessão da área do cliente", () => {
  it("remove o cookie quando a sessão foi recusada", async () => {
    const unauthorized = Response.json({ detail: "Sessão inválida" }, { status: 401 })
    portalBackendRequest.mockResolvedValue(unauthorized)

    const response = await GET({} as NextRequest)

    expect(response.status).toBe(401)
    expect(clearPortalCookie).toHaveBeenCalledWith(response)
  })

  it("encaminha a alteração dos dados do cliente autenticado", async () => {
    const updated = { id: "customer-1", name: "Novo Nome", email: "novo@example.com" }
    portalBackendRequest.mockResolvedValue(Response.json(updated))
    const request = new NextRequest("https://omi.test/api/portal/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Origin: "https://omi.test" },
      body: JSON.stringify({ name: "Novo Nome", email: "novo@example.com" }),
    })

    const response = await PATCH(request)

    expect(response.status).toBe(200)
    expect(portalBackendRequest).toHaveBeenCalledWith(
      request,
      "/api/v1/portal/me/",
      expect.objectContaining({ method: "PATCH" }),
    )
  })
})
