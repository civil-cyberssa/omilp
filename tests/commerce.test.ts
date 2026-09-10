import { describe, expect, it } from "vitest"

import { formatOfferFeature, getOfferDescription, getOfferPricing } from "@/lib/commerce"

describe("getOfferPricing", () => {
  it("shows the monthly equivalent while preserving the annual total", () => {
    expect(
      getOfferPricing({ kind: "SUBSCRIPTION", cycle: "YEARLY", price: "1200.00" }),
    ).toEqual({
      displayAmount: 100,
      displayCycle: "mês",
      annualTotal: 1200,
      isYearly: true,
    })
  })

  it("keeps monthly and one-time offers unchanged", () => {
    expect(
      getOfferPricing({ kind: "SUBSCRIPTION", cycle: "MONTHLY", price: "149.90" }),
    ).toMatchObject({ displayAmount: 149.9, displayCycle: "mês", annualTotal: null })
    expect(
      getOfferPricing({ kind: "ONE_TIME", cycle: "MONTHLY", price: "900.00" }),
    ).toMatchObject({ displayAmount: 900, displayCycle: null, annualTotal: null })
  })
})

describe("copy das ofertas", () => {
  it("transforma rótulos técnicos em benefícios claros", () => {
    expect(formatOfferFeature("WhatsApp")).toBe("Botão de WhatsApp integrado")
    expect(formatOfferFeature("SSL")).toBe("Certificado SSL incluído")
    expect(formatOfferFeature("3 alterações por mês gratuitas")).toBe(
      "3 solicitações de alteração incluídas por mês",
    )
  })

  it("não exibe SEO básico quando a mesma oferta anuncia SEO avançado", () => {
    expect(getOfferDescription({
      description: "Site com Analytics e SEO básico.",
      short_description: "Site profissional.",
      features: ["SEO Avançado"],
    })).toBe("Site com Analytics e estrutura técnica para SEO.")
  })
})
