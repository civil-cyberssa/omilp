import { beforeEach, describe, expect, it, vi } from "vitest"
import type { NextRequest } from "next/server"

vi.mock("server-only", () => ({}))
const { getToken } = vi.hoisted(() => ({ getToken: vi.fn() }))
vi.mock("next-auth/jwt", () => ({ getToken, encode: vi.fn() }))

import { authenticatedBackendRequest, validateMutationOrigin } from "@/lib/server-auth"
import { getAuthSecret } from "@/lib/auth-config"

function request() {
  return {
    headers: new Headers(),
    nextUrl: new URL("https://omi.test/api/backoffice/posts"),
  } as unknown as NextRequest
}

describe("proxy autenticado", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    getToken.mockReset()
    process.env.AUTH_SECRET = "test-secret-with-at-least-thirty-two-bytes"
    process.env.NEXT_PUBLIC_SITE_URL = "https://omi.test"
  })

  it("faz um refresh e repete uma única vez após 401", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ access: "access-2", refresh: "refresh-2" }))
      .mockResolvedValueOnce(Response.json({ ok: true }))
    getToken.mockResolvedValue({
      backendAccessToken: "access-1",
      backendRefreshToken: "refresh-1",
      backendAccessTokenExpiresAt: Date.now() + 60_000,
    })

    const result = await authenticatedBackendRequest(
      request(),
      "/api/v1/blog/posts/",
    )

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(result.response.status).toBe(200)
    expect(result.authToken).toEqual(expect.objectContaining({
      backendAccessToken: "access-2",
      backendRefreshToken: "refresh-2",
    }))
    expect(new Headers(fetchMock.mock.calls[2][1]?.headers).get("Authorization")).toBe("Bearer access-2")
  })

  it("encerra a sessão quando o refresh é inválido", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
    getToken.mockResolvedValue({
      backendAccessToken: "expired",
      backendRefreshToken: "invalid",
      backendAccessTokenExpiresAt: Date.now() + 60_000,
    })

    const result = await authenticatedBackendRequest(
      request(),
      "/api/auth/me/",
    )

    expect(result.clearSession).toBe(true)
  })

  it("limpa um access inválido quando não existe refresh", async () => {
    getToken.mockResolvedValue(null)

    const result = await authenticatedBackendRequest(
      request(),
      "/api/auth/me/",
    )

    expect(result.clearSession).toBe(true)
  })

  it("exige uma origem válida em mutações", () => {
    const valid = request()
    valid.headers.set("origin", "https://omi.test")
    expect(validateMutationOrigin(valid)).toBe(true)
    const missing = request()
    expect(validateMutationOrigin(missing)).toBe(false)
  })

  it("não confia no Host recebido quando existe uma origem configurada", () => {
    const poisoned = {
      headers: new Headers({ origin: "https://attacker.test" }),
      nextUrl: new URL("https://attacker.test/api/backoffice/posts"),
    } as unknown as NextRequest

    expect(validateMutationOrigin(poisoned)).toBe(false)
    poisoned.headers.set("origin", "origem inválida")
    expect(validateMutationOrigin(poisoned)).toBe(false)
  })

  it("aceita temporariamente o nome legado do segredo do Auth.js", () => {
    delete process.env.AUTH_SECRET
    delete process.env.NEXTAUTH_SECRET
    process.env.BETTER_AUTH_SECRET = "legacy-secret-with-at-least-thirty-two-bytes"

    expect(getAuthSecret()).toBe("legacy-secret-with-at-least-thirty-two-bytes")
  })
})
