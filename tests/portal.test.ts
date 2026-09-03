import { afterEach, describe, expect, it, vi } from "vitest"

import { PortalRequestError, apiErrorMessage, portalFetcher } from "@/lib/portal"

afterEach(() => vi.restoreAllMocks())

describe("portal do cliente", () => {
  it("preserva o status e a mensagem de erros da API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({
      error: { details: { detail: "Sessão inválida" } },
    }, { status: 401 }))

    await expect(portalFetcher("/api/portal/me")).rejects.toEqual(
      expect.objectContaining<Partial<PortalRequestError>>({
        status: 401,
        message: "Sessão inválida",
      }),
    )
  })

  it("lê mensagens normalizadas e fornece fallback", () => {
    expect(apiErrorMessage({ error: { details: { message: "Backend indisponível" } } }, "Falha")).toBe("Backend indisponível")
    expect(apiErrorMessage({}, "Falha")).toBe("Falha")
  })
})
