import { beforeEach, describe, expect, it, vi } from "vitest"
import type { NextRequest } from "next/server"

vi.mock("server-only", () => ({}))

import { authenticatedBackendRequest, validateMutationOrigin } from "@/lib/server-auth"

function requestWithCookies(values: Record<string, string>) {
  return {
    cookies: { get: (name: string) => values[name] ? { value: values[name] } : undefined },
    headers: new Headers(),
    nextUrl: new URL("https://omi.test/api/backoffice/posts"),
  } as unknown as NextRequest
}

describe("proxy autenticado", () => {
  beforeEach(() => vi.restoreAllMocks())

  it("faz um refresh e repete uma única vez após 401", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ access: "access-2", refresh: "refresh-2" }))
      .mockResolvedValueOnce(Response.json({ ok: true }))

    const result = await authenticatedBackendRequest(
      requestWithCookies({ omi_access: "access-1", omi_refresh: "refresh-1" }),
      "/api/v1/blog/posts/",
    )

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(result.response.status).toBe(200)
    expect(result.tokens).toEqual({ access: "access-2", refresh: "refresh-2" })
    expect(new Headers(fetchMock.mock.calls[2][1]?.headers).get("Authorization")).toBe("Bearer access-2")
  })

  it("encerra a sessão quando o refresh é inválido", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }))

    const result = await authenticatedBackendRequest(
      requestWithCookies({ omi_access: "expired", omi_refresh: "invalid" }),
      "/api/auth/me/",
    )

    expect(result.clearSession).toBe(true)
  })

  it("limpa um access inválido quando não existe refresh", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(null, { status: 401 }))

    const result = await authenticatedBackendRequest(
      requestWithCookies({ omi_access: "expired" }),
      "/api/auth/me/",
    )

    expect(result.clearSession).toBe(true)
  })

  it("exige uma origem válida em mutações", () => {
    const valid = requestWithCookies({})
    valid.headers.set("origin", "https://omi.test")
    expect(validateMutationOrigin(valid)).toBe(true)
    const missing = requestWithCookies({})
    expect(validateMutationOrigin(missing)).toBe(false)
  })
})
