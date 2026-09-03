import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const { sendContactEmail, validateMutationOrigin } = vi.hoisted(() => ({
  sendContactEmail: vi.fn(),
  validateMutationOrigin: vi.fn(),
}))
vi.mock("@/lib/contact-email-service", () => ({ sendContactEmail }))
vi.mock("@/lib/server-auth", () => ({ validateMutationOrigin }))

import { POST } from "@/app/api/contact/route"
import { buildSecurityHeaders } from "@/lib/security-headers.mjs"

function contactRequest(
  body: Record<string, unknown> | string,
  options: { origin?: string; address?: string; contentType?: string; contentLength?: string } = {},
) {
  const serialized = typeof body === "string" ? body : JSON.stringify(body)
  return {
    nextUrl: new URL("http://localhost:3000/api/contact"),
    headers: new Headers({
      origin: options.origin ?? "http://localhost:3000",
      "content-type": options.contentType ?? "application/json",
      "x-forwarded-for": options.address ?? "198.51.100.1",
      ...(options.contentLength ? { "content-length": options.contentLength } : {}),
    }),
    text: async () => serialized,
  } as unknown as NextRequest
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    name: "Cliente",
    email: "cliente@example.com",
    company: "Empresa",
    message: "Quero conversar sobre um projeto.",
    humanLeft: 2,
    humanRight: 3,
    humanAnswer: "5",
    ...overrides,
  }
}

describe("hardening do frontend", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    sendContactEmail.mockReset().mockResolvedValue(undefined)
    validateMutationOrigin.mockReset().mockImplementation(
      (request: NextRequest) => request.headers.get("origin") === request.nextUrl.origin,
    )
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000"
  })

  it("bloqueia CSRF no formulário de contato", async () => {
    const response = await POST(contactRequest(validBody(), {
      origin: "https://evil.example",
      address: "198.51.100.2",
    }))

    expect(response.status).toBe(403)
    expect(validateMutationOrigin).toHaveBeenCalledOnce()
    expect(sendContactEmail).not.toHaveBeenCalled()
  })

  it("rejeita tipo, tamanho e JSON inválidos", async () => {
    expect((await POST(contactRequest(validBody(), {
      contentType: "text/plain",
      address: "198.51.100.3",
    }))).status).toBe(415)
    expect((await POST(contactRequest(validBody(), {
      contentLength: "20000",
      address: "198.51.100.4",
    }))).status).toBe(413)
    expect((await POST(contactRequest("{", {
      address: "198.51.100.5",
    }))).status).toBe(400)
    expect((await POST(contactRequest("null", {
      address: "198.51.100.8",
    }))).status).toBe(400)
  })

  it("rejeita caracteres de controle usados em header injection", async () => {
    const response = await POST(contactRequest(validBody({ name: "Atacante\r\nBcc: alvo@example.com" }), {
      address: "198.51.100.6",
    }))

    expect(response.status).toBe(400)
    expect(sendContactEmail).not.toHaveBeenCalled()
  })

  it("limita rajadas de envio por endereço", async () => {
    const statuses = []
    for (let index = 0; index < 6; index += 1) {
      statuses.push((await POST(contactRequest(validBody(), {
        address: "198.51.100.7",
      }))).status)
    }

    expect(statuses).toEqual([200, 200, 200, 200, 200, 429])
    expect(sendContactEmail).toHaveBeenCalledTimes(5)
  })

  it("publica headers defensivos em todas as rotas", async () => {
    const headers = new Map(
      buildSecurityHeaders("https://api.omi.test/api/v1", true)
        .map(({ key, value }) => [key, value]),
    )

    expect(headers.get("Content-Security-Policy")).toContain("object-src 'none'")
    expect(headers.get("Content-Security-Policy")).toContain("frame-src https:")
    expect(headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'")
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff")
    expect(headers.get("X-Frame-Options")).toBe("DENY")
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin")
    expect(headers.get("Permissions-Policy")).toContain("camera=()")
    expect(headers.get("Strict-Transport-Security")).toContain("includeSubDomains")
  })
})
