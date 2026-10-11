import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  projectResults: [] as Array<Record<string, unknown>>,
  briefing: null as Record<string, unknown> | null,
  asaasLog: [] as Array<Record<string, unknown>>,
  mutate: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  success: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}))

vi.mock("sonner", () => ({
  toast: { success: mocks.success, error: vi.fn() },
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
    : { data: { ...order, briefing: mocks.briefing, asaas_log: mocks.asaasLog }, error: undefined, mutate: mocks.mutate },
}))

import { BillingDetail } from "@/components/dashboard/billing-detail"

describe("BillingDetail projects", () => {
  beforeEach(() => {
    mocks.projectResults = []
    mocks.briefing = null
    mocks.asaasLog = []
    mocks.mutate.mockReset()
    mocks.replace.mockReset()
    mocks.refresh.mockReset()
    mocks.success.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it("oferece cadastrar um projeto com o pedido pré-selecionado", () => {
    render(<BillingDetail type="orders" id="order-1" />)

    const links = screen.getAllByRole("link", { name: "Adicionar projeto" })
    expect(links[0]).toHaveAttribute("href", "/dashboard/projetos/novo?type=order&id=order-1")
  })

  it("exibe o briefing vinculado ao pedido", () => {
    mocks.briefing = {
      id: "briefing-1",
      project_name: "Novo site da Omi",
      business_description: "Estúdio de tecnologia",
      goals: "Gerar oportunidades comerciais",
      target_audience: "Empresas locais",
      visual_references: "Sites editoriais",
      desired_pages: ["Início", "Serviços", "Contato"],
      brand_assets_url: "https://example.com/marca",
      extra_data: {
        domain: { has_domain: true, current: "omi.example.com" },
        brand_colors: { hexes: ["#155EEF", "#4338FF"] },
        color_to_avoid: "Laranja",
      },
      status: "RECEIVED",
      edited_at: null,
      created_at: "2026-09-03T12:00:00Z",
      updated_at: "2026-09-03T12:00:00Z",
    }

    render(<BillingDetail type="orders" id="order-1" />)

    expect(screen.getByText("Novo site da Omi")).toBeInTheDocument()
    expect(screen.getByText("Início, Serviços, Contato")).toBeInTheDocument()
    expect(screen.getByText("Gerar oportunidades comerciais")).toBeInTheDocument()
    expect(screen.getByText("omi.example.com")).toBeInTheDocument()
  })

  it("exibe o log do Asaas no status financeiro", () => {
    mocks.asaasLog = [{
      payment_id: "pay_123",
      event_id: "evt_123",
      event_type: "PAYMENT_RECEIVED",
      status: "RECEIVED",
      billing_type: "PIX",
      value: "500.00",
      net_value: "490.00",
      due_date: "2026-09-03",
      paid_at: "2026-09-03T12:00:00Z",
      received_at: "2026-09-03T12:05:00Z",
      processed: true,
      error: "",
    }]

    render(<BillingDetail type="orders" id="order-1" />)

    expect(screen.getByText("Log do Asaas")).toBeInTheDocument()
    expect(screen.getByText("Pagamento recebido")).toBeInTheDocument()
    expect(screen.getByText("pay_123")).toBeInTheDocument()
    expect(screen.getByText("evt_123")).toBeInTheDocument()
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

  it("exclui o pedido e volta para a listagem", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true)
    const request = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 204 }),
    )
    render(<BillingDetail type="orders" id="order-1" />)

    fireEvent.click(screen.getByRole("button", { name: "Excluir pedido" }))

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/dashboard/pedidos"))
    expect(request).toHaveBeenCalledWith(
      "/api/backoffice/orders/order-1",
      { method: "DELETE", cache: "no-store" },
    )
    expect(mocks.success).toHaveBeenCalledWith("Pedido excluído com sucesso.")
    expect(mocks.refresh).toHaveBeenCalledOnce()
  })
})
