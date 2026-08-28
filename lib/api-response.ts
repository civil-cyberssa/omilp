import "server-only"

import { NextResponse } from "next/server"

type ErrorDetails = unknown

function codeForStatus(status: number) {
  if (status === 400) return "VALIDATION_ERROR"
  if (status === 401) return "UNAUTHORIZED"
  if (status === 403) return "FORBIDDEN"
  if (status === 404) return "NOT_FOUND"
  if (status === 409) return "CONFLICT"
  if (status === 429) return "RATE_LIMITED"
  return status >= 500 ? "UPSTREAM_ERROR" : "REQUEST_ERROR"
}

export function apiError(status: number, code: string, details: ErrorDetails) {
  return NextResponse.json(
    { error: { status, code, details } },
    { status, headers: { "Cache-Control": "no-store" } },
  )
}

function normalizeErrorPayload(status: number, payload: unknown) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: unknown }).error
    if (error && typeof error === "object") {
      const value = error as { code?: string; details?: unknown }
      return {
        error: {
          status,
          code: value.code ?? codeForStatus(status),
          details: value.details ?? error,
        },
      }
    }
  }
  return { error: { status, code: codeForStatus(status), details: payload } }
}

export async function proxyUpstreamResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""
  const body = await response.arrayBuffer()
  if (response.ok && (response.status === 204 || response.status === 205)) {
    return new NextResponse(null, {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    })
  }
  if (contentType.includes("application/json")) {
    try {
      const payload = JSON.parse(new TextDecoder().decode(body))
      return NextResponse.json(
        response.ok ? payload : normalizeErrorPayload(response.status, payload),
        {
          status: response.status,
          headers: { "Cache-Control": "no-store" },
        },
      )
    } catch {
      return apiError(502, "INVALID_UPSTREAM_RESPONSE", {
        message: "O serviço retornou um JSON inválido.",
        upstream_status: response.status,
      })
    }
  }
  if (!response.ok) {
    return apiError(response.status, "NON_JSON_UPSTREAM_ERROR", {
      message: "O serviço retornou uma resposta de erro em formato inesperado.",
      upstream_status: response.status,
      content_type: contentType || "desconhecido",
    })
  }
  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type": contentType || "application/octet-stream",
      ...(response.headers.get("content-disposition")
        ? { "Content-Disposition": response.headers.get("content-disposition") as string }
        : {}),
      "Cache-Control": "no-store",
    },
  })
}

export async function readUpstreamJson<T>(response: Response): Promise<
  | { data: T; error?: never }
  | { data?: never; error: NextResponse }
> {
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    return {
      error: apiError(response.ok ? 502 : response.status, "NON_JSON_UPSTREAM_ERROR", {
        message: "O serviço retornou uma resposta em formato inesperado.",
        upstream_status: response.status,
        content_type: contentType || "desconhecido",
      }),
    }
  }
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    return {
      error: apiError(502, "INVALID_UPSTREAM_RESPONSE", {
        message: "O serviço retornou um JSON inválido.",
        upstream_status: response.status,
      }),
    }
  }
  if (!response.ok) {
    return {
      error: NextResponse.json(normalizeErrorPayload(response.status, payload), {
        status: response.status,
        headers: { "Cache-Control": "no-store" },
      }),
    }
  }
  return { data: payload as T }
}

export async function withRouteErrorHandling(
  route: string,
  handler: () => Promise<Response>,
) {
  try {
    return await handler()
  } catch (cause) {
    if (cause instanceof SyntaxError) {
      return apiError(400, "INVALID_JSON", {
        message: "O corpo da requisição deve conter um JSON válido.",
      })
    }
    console.error(`[${route}]`, cause)
    if (
      cause instanceof TypeError &&
      /fetch|network|connect|socket|econn/i.test(cause.message)
    ) {
      return apiError(502, "BACKEND_UNAVAILABLE", {
        message: "Não foi possível conectar ao serviço de backend.",
      })
    }
    return apiError(500, "INTERNAL_SERVER_ERROR", {
      message: "Erro interno ao processar a requisição.",
    })
  }
}
