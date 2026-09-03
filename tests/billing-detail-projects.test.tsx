import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  projectResults: [] as Array<Record<string, unknown>>,
  mutate: vi.fn(),
}))

const order = {
  id: "order-1",
  customer: { id: "customer-1", name: "Cliente", email: "cliente@example.com", phone: "", company: "", cpf_cnpj: "" },
  offer: { id: "offer-1", name: "Site institucional" },
  status: "PAID",
  billing_type: "PIX",
  total: "500.00",
  due_date: "2026-09-03",
  notes: "",
  checkout_url: "",
  monthly_change_request_limit: 2,
  created_at: "2026-09-03T12:00:00Z",
  updated_at: "2026-09-03T12:00:00Z",
}

vi.mock("swr", () => ({
  default: (key: string) => key.startsWith("/api/backoffice/projects")
    ? { data: { count: mocks.projectResults.length, next: null, previous: null, results: mocks.projectResults }, error: undefined }
    : { data: order, error: undefined, mutate: mocks.mutate },
}))

import { BillingDetail } from "@/components/dashboard/billing-detail"

describe("BillingDetail projects", () => {
  beforeEach(() => {
    mocks.projectResults = []
    mocks.mutate.mockReset()
  })

  afterEach(cleanup)

  it("oferece cadastrar um projeto com o pedido pré-selecionado", () => {
    render(<BillingDetail type="orders" id="order-1" />)

    const links = screen.getAllByRole("link", { name: "Adicionar projeto" })
    expect(links[0]).toHaveAttribute("href", "/dashboard/projetos/novo?type=order&id=order-1")
  })

  it("mostra e permite gerenciar o projeto relacionado", () => {
    mocks.projectResults = [{
      id: "project-1",
      site: "https://cliente.example.com",
      offer_name: "Site institucional",
    }]

    render(<BillingDetail type="orders" id="order-1" />)

    expect(screen.getByRole("link", { name: "Gerenciar projeto" })).toHaveAttribute("href", "/dashboard/projetos/project-1")
    expect(screen.queryByRole("link", { name: "Adicionar projeto" })).not.toBeInTheDocument()
  })
})
