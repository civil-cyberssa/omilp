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

export function formatApiError(status: number, payload: ApiErrorPayload) {
  const structured = typeof payload.error === "object" ? payload.error : undefined
  const message = detailMessage(structured?.details ?? payload.detail ?? payload.error)
  const code = structured?.code ? ` · ${structured.code}` : ""
  return `Erro ${structured?.status ?? status}${code}: ${message || "Não foi possível concluir a operação."}`
}
