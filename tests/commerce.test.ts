import { describe, expect, it } from "vitest"

import { getOfferPricing } from "@/lib/commerce"

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
