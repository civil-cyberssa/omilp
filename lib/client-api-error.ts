type ApiErrorPayload = {
  error?: {
    status?: number
    code?: string
    details?: unknown
  } | string
  detail?: unknown
}

function detailMessage(details: unknown): string {
  if (typeof details === "string") return details
  if (Array.isArray(details)) return details.map(detailMessage).filter(Boolean).join("; ")
  if (details && typeof details === "object") {
    const value = details as Record<string, unknown>
    if (typeof value.message === "string") return value.message
    return Object.values(value).map(detailMessage).filter(Boolean).join("; ")
  }
  return ""
}

export function getApiErrorMessage(
  payload: ApiErrorPayload,
  fallback = "Não foi possível concluir a operação.",
) {
  const structured = typeof payload.error === "object" ? payload.error : undefined
  return detailMessage(structured?.details ?? payload.detail ?? payload.error) || fallback
}

export function formatApiError(status: number, payload: ApiErrorPayload) {
  const structured = typeof payload.error === "object" ? payload.error : undefined
  const message = getApiErrorMessage(payload)
  const code = structured?.code ? ` · ${structured.code}` : ""
  return `Erro ${structured?.status ?? status}${code}: ${message}`
}
