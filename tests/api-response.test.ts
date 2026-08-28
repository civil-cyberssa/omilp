import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import { proxyUpstreamResponse, readUpstreamJson, withRouteErrorHandling } from "@/lib/api-response"
import { formatApiError, getApiErrorMessage } from "@/lib/client-api-error"

describe("respostas das rotas", () => {
  it("converte erro HTML do serviço em JSON com status preservado", async () => {
    const response = await proxyUpstreamResponse(new Response("<html>erro</html>", {
      status: 503,
      headers: { "Content-Type": "text/html" },
    }))

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({
      error: {
        status: 503,
        code: "NON_JSON_UPSTREAM_ERROR",
        details: {
          message: "O serviço retornou uma resposta de erro em formato inesperado.",
          upstream_status: 503,
          content_type: "text/html",
        },
      },
    })
  })

  it("preserva status e detalhes de validação do Django", async () => {
    const parsed = await readUpstreamJson(new Response(JSON.stringify({
      error: { status: 400, details: { payment_gateway: "Callback inválido" } },
    }), { status: 400, headers: { "Content-Type": "application/json" } }))

    expect(parsed.error?.status).toBe(400)
    expect(await parsed.error?.json()).toEqual({
      error: {
        status: 400,
        code: "VALIDATION_ERROR",
        details: { payment_gateway: "Callback inválido" },
      },
    })
  })

  it("retorna 502 estruturado quando o backend está indisponível", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    const response = await withRouteErrorHandling("POST /api/checkout", async () => {
      throw new TypeError("fetch failed")
    })

    expect(response.status).toBe(502)
    expect((await response.json()).error.code).toBe("BACKEND_UNAVAILABLE")
  })

  it("formata status, código e mensagem para a interface", () => {
    expect(formatApiError(400, {
      error: {
        status: 400,
        code: "VALIDATION_ERROR",
        details: { payment_gateway: "Callback inválido" },
      },
    })).toBe("Erro 400 · VALIDATION_ERROR: Callback inválido")
  })

  it("extrai a mensagem de um erro estruturado de autenticação", () => {
    expect(getApiErrorMessage({
      error: {
        status: 401,
        code: "INVALID_CREDENTIALS",
        details: { message: "E-mail ou senha inválidos." },
      },
    }, "Não foi possível entrar.")).toBe("E-mail ou senha inválidos.")
  })
})
