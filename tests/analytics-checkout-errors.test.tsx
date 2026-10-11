import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { CheckoutErrors } from "@/app/dashboard/(protected)/analytics/page"
import type { AnalyticsSummary } from "@/lib/dashboard-api"

afterEach(cleanup)

describe("erros de checkout no analytics", () => {
  it("mantém o detalhe aberto e exibe o JSON completo da requisição", () => {
    const data = {
      period_days: 30,
      totals: {
        views: 0,
        visitors: 0,
        sessions: 0,
        conversions: 0,
        whatsapp_clicks: 0,
        offer_views: 0,
        offer_viewers: 0,
        offer_view_rate: 0,
        checkout_errors: 1,
        conversion_rate: 0,
      },
      daily: [],
      hourly: [],
      sources: [],
      campaigns: [],
      pages: [],
      sections: [],
      offers: [],
      checkout_error_types: [{ error_type: "http_error", count: 1 }],
      checkout_errors: [{
        id: "error-1",
        path: "/contratar/essencial",
        error_type: "http_error",
        error_code: "PAYMENT_REFUSED",
        message: "Pagamento recusado",
        status_code: 422,
        endpoint: "/api/checkout",
        method: "POST",
        offer: "essencial",
        billing_type: "CREDIT_CARD",
        checkout_step: 2,
        request_payload: {
          customer: { cpf_cnpj: "52998224725", street: "Rua Chile" },
        },
        response_payload: null,
        inputs: null,
        validation_fields: [],
        created_at: "2026-10-11T12:00:00Z",
      }],
    } satisfies AnalyticsSummary

    const { container } = render(<CheckoutErrors data={data} />)

    expect(container.querySelector("details")).toHaveAttribute("open")
    expect(container.querySelector("pre")?.textContent).toContain('"cpf_cnpj": "52998224725"')
    expect(container.querySelector("pre")?.textContent).toContain('"street": "Rua Chile"')
  })
})
