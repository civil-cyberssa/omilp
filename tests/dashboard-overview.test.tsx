import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import DashboardPage from "@/app/dashboard/(protected)/page"

vi.mock("@/components/dashboard/calendar-overview", () => ({
  CalendarOverview: () => <div>Calendário</div>,
}))

vi.mock("swr", () => ({
  default: (key: string) => {
    if (key === "/api/backoffice/billing/overview") {
      return {
        data: {
          orders: 3,
          subscriptions: 2,
          revenue: "750.00",
          asaas_available_balance: "87.65",
          asaas_balance_available: true,
          asaas_pending_amount: "142.30",
          asaas_pending_amount_available: true,
        },
        error: undefined,
      }
    }
    if (key === "/api/backoffice/posts/summary") {
      return { data: { published: 0, draft: 0, total_views: 0 } }
    }
    return { data: { count: 0, next: null, previous: null, results: [] }, error: undefined }
  },
}))

afterEach(cleanup)

describe("visão geral do dashboard", () => {
  it("exibe o valor pendente abaixo do saldo disponível do Asaas", () => {
    render(<DashboardPage />)

    const availableLabel = screen.getByText("Disponível no Asaas")
    const pendingLabel = screen.getByText("Pendente no Asaas")

    expect(availableLabel.parentElement).toHaveTextContent("R$ 87,65")
    expect(pendingLabel.parentElement).toHaveTextContent("R$ 142,30")
    expect(availableLabel.compareDocumentPosition(pendingLabel)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })
})
