import { NextRequest } from "next/server"
import { describe, expect, it, vi } from "vitest"

const { portalBackendRequest } = vi.hoisted(() => ({
  portalBackendRequest: vi.fn(),
}))

vi.mock("server-only", () => ({}))
vi.mock("@/lib/portal-auth", () => ({
  passThrough: (response: Response) => response,
  portalBackendRequest,
}))
vi.mock("@/lib/server-auth", () => ({ validateMutationOrigin: () => true }))

import { PATCH } from "@/app/api/portal/briefings/[id]/route"

describe("edição de briefing no portal", () => {
  it("encaminha o PATCH para o briefing do cliente autenticado", async () => {
    portalBackendRequest.mockResolvedValue(Response.json({ id: "briefing-1" }))
    const request = new NextRequest("https://omi.test/api/portal/briefings/briefing-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Origin: "https://omi.test" },
      body: JSON.stringify({ goals: "Novos objetivos" }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: "briefing-1" }) })

    expect(response.status).toBe(200)
    expect(portalBackendRequest).toHaveBeenCalledWith(
      request,
      "/api/v1/portal/briefings/briefing-1/",
      expect.objectContaining({ method: "PATCH" }),
    )
  })
})
