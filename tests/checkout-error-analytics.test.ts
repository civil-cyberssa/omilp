import { afterEach, describe, expect, it, vi } from "vitest"

import { sanitizeCheckoutData, trackCheckoutError } from "@/lib/checkout-error-analytics"

afterEach(() => vi.restoreAllMocks())

describe("analytics de erros do checkout", () => {
  it("remove dados financeiros e mascara dados pessoais", () => {
    expect(sanitizeCheckoutData({
      customer: {
        name: "Maria Cliente",
        email: "maria@example.com",
        phone: "71999999999",
        cpf_cnpj: "52998224725",
        street: "Rua Chile",
      },
      credit_card: {
        number: "4444 4444 4444 4444",
        expiry_month: "12",
        expiry_year: "2030",
        ccv: "123",
      },
    })).toEqual({
      customer: {
        name: "Maria Cliente",
        email: "maria@example.com",
        phone: "71999999999",
        cpf_cnpj: "••••4725",
        street: "[preenchido]",
      },
      credit_card: {
        number: "••••4444",
        expiry_month: "[removido]",
        expiry_year: "[removido]",
        ccv: "[removido]",
      },
    })
  })

  it("envia tipo, status, JSON e inputs sanitizados para o analytics", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ accepted: true }))

    await trackCheckoutError({
      errorType: "http_error",
      errorCode: "PAYMENT_REFUSED",
      message: "Pagamento recusado",
      statusCode: 422,
      endpoint: "/api/checkout",
      method: "POST",
      offer: "essencial",
      billingType: "CREDIT_CARD",
      checkoutStep: 2,
      requestPayload: { credit_card: { number: "4444444444444444", ccv: "123" } },
      inputs: { customer: { email: "maria@example.com" } },
    })

    const payload = JSON.parse(String(fetchMock.mock.calls[0][1]?.body))
    expect(payload).toMatchObject({
      event_type: "checkout_error",
      metadata: {
        error_type: "http_error",
        error_code: "PAYMENT_REFUSED",
        status_code: 422,
        endpoint: "/api/checkout",
        offer: "essencial",
        request_payload: { credit_card: { number: "••••4444", ccv: "[removido]" } },
        inputs: { customer: { email: "maria@example.com" } },
      },
    })
  })
})
