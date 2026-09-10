import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { BillingCycleSelector } from "@/components/billing-cycle-selector"

afterEach(cleanup)

describe("BillingCycleSelector", () => {
  it("alterna entre ofertas mensais e anuais", () => {
    render(
      <BillingCycleSelector
        hasMonthly
        hasYearly
        monthly={<p>Oferta mensal</p>}
        yearly={<p>Oferta anual</p>}
      />,
    )

    expect(screen.getByText("Oferta anual")).toBeInTheDocument()
    expect(screen.queryByText("Oferta mensal")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("radio", { name: "Mensal" }))

    expect(screen.getByText("Oferta mensal")).toBeInTheDocument()
    expect(screen.queryByText("Oferta anual")).not.toBeInTheDocument()
  })

  it("inicia no anual quando não há oferta mensal", () => {
    render(
      <BillingCycleSelector
        hasMonthly={false}
        hasYearly
        monthly={null}
        yearly={<p>Oferta anual</p>}
      />,
    )

    expect(screen.getByRole("radio", { name: "Mensal" })).toBeDisabled()
    expect(screen.getByRole("radio", { name: "Anual" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByText("Oferta anual")).toBeInTheDocument()
  })

  it("usa o mensal como alternativa quando não há oferta anual", () => {
    render(
      <BillingCycleSelector
        hasMonthly
        hasYearly={false}
        monthly={<p>Oferta mensal</p>}
        yearly={null}
      />,
    )

    expect(screen.getByRole("radio", { name: "Mensal" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("radio", { name: "Anual" })).toBeDisabled()
    expect(screen.getByText("Oferta mensal")).toBeInTheDocument()
  })
})
