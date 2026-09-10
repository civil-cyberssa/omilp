"use client"

import { trackAnalyticsEvent } from "@/lib/analytics"

export type CheckoutErrorType =
  | "form_validation"
  | "http_error"
  | "invalid_response"
  | "network_error"
  | "postal_code_lookup"
  | "runtime_error"

type CheckoutErrorDetails = {
  errorType: CheckoutErrorType
  errorCode?: string
  message: string
  statusCode?: number | null
  endpoint?: string
  method?: string
  offer?: string
  billingType?: string
  checkoutStep?: number
  requestPayload?: unknown
  responsePayload?: unknown
  inputs?: unknown
  validationFields?: string[]
}

const REDACTED = "[removido]"
const FILLED = "[preenchido]"
const sensitiveKeys = new Set([
  "authorization",
  "ccv",
  "cvv",
  "idempotency_key",
  "password",
  "secret",
  "token",
])
const identityKeys = new Set([
  "address_complement",
  "address_number",
  "company",
  "holder_name",
  "neighborhood",
  "street",
])

function lastDigits(value: unknown, visible = 4) {
  const digits = String(value ?? "").replace(/\D/g, "")
  return digits ? `••••${digits.slice(-visible)}` : REDACTED
}

function sanitizeMessage(value: unknown) {
  return String(value ?? "")
    .slice(0, 500)
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "[e-mail removido]")
    .replace(/(?:\d[\s./-]?){9,19}/g, "[número removido]")
}

function sanitizeValue(value: unknown, key = "", parentKey = "", depth = 0): unknown {
  if (depth > 6) return "[limite de profundidade]"
  const normalizedKey = key.toLowerCase()
  const normalizedParent = parentKey.toLowerCase()
  if (sensitiveKeys.has(normalizedKey) || /(authorization|password|secret|token)/.test(normalizedKey)) return REDACTED
  if (
    (normalizedKey === "number" && normalizedParent === "credit_card")
    || ["card_number", "credit_card_number"].includes(normalizedKey)
  ) return lastDigits(value)
  if (normalizedKey === "cpf_cnpj") return lastDigits(value)
  if (normalizedKey === "postal_code") return lastDigits(value, 3)
  if (normalizedKey === "message") return sanitizeMessage(value)
  if (identityKeys.has(normalizedKey)) return value ? FILLED : ""
  if (normalizedKey === "expiry_month" || normalizedKey === "expiry_year") return REDACTED
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeValue(item, key, parentKey, depth + 1))
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, 50)
        .map(([childKey, childValue]) => [
          childKey.slice(0, 80),
          sanitizeValue(childValue, childKey, key, depth + 1),
        ]),
    )
  }
  if (typeof value === "string") return value.slice(0, 500)
  if (value === null || ["boolean", "number"].includes(typeof value)) return value
  return String(value ?? "").slice(0, 500)
}

export function sanitizeCheckoutData(value: unknown) {
  return sanitizeValue(value)
}

export async function trackCheckoutError(details: CheckoutErrorDetails) {
  await trackAnalyticsEvent("checkout_error", {
    error_type: details.errorType,
    error_code: details.errorCode?.slice(0, 120) ?? "",
    message: sanitizeMessage(details.message),
    status_code: details.statusCode ?? null,
    endpoint: details.endpoint?.slice(0, 500) ?? "",
    method: details.method?.slice(0, 12) ?? "",
    offer: details.offer?.slice(0, 160) ?? "",
    billing_type: details.billingType?.slice(0, 40) ?? "",
    checkout_step: details.checkoutStep ?? null,
    request_payload: sanitizeCheckoutData(details.requestPayload ?? null),
    response_payload: sanitizeCheckoutData(details.responsePayload ?? null),
    inputs: sanitizeCheckoutData(details.inputs ?? null),
    validation_fields: details.validationFields?.slice(0, 30) ?? [],
  })
}
