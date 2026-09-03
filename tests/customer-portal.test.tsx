import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const mutate = vi.fn()

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }))
vi.mock("swr", () => ({
  default: () => ({
    data: {
      customer: { id: "customer-1", name: "Maria Cliente", email: "maria@example.com", phone: "", company: "" },
      orders: [],
      subscriptions: [],
      projects: [],
      briefings: [{
        id: "briefing-1",
        project_name: "Site institucional",
        business_description: "Empresa",
        goals: "Vendas",
        target_audience: "Empresas",
        visual_references: "",
        desired_pages: ["Início"],
        brand_assets_url: "",
        extra_data: {},
        status: "RECEIVED",
        created_at: "2026-08-27T12:00:00Z",
        updated_at: "2026-09-03T12:00:00Z",
        edited_at: "2026-09-03T12:00:00Z",
        subscription: null,
        order: null,
      }],
    },
    error: undefined,
    mutate,
  }),
}))

import { CustomerPortal } from "@/components/customer-portal"

afterEach(cleanup)

describe("CustomerPortal", () => {
  it("mostra o resumo e o acesso aos dados do cliente", () => {
    render(<CustomerPortal />)

    expect(screen.getByRole("link", { name: "Meus dados" })).toHaveAttribute("href", "/area-cliente/perfil")
    expect(screen.getAllByText("Pedidos").length).toBeGreaterThan(0)
    expect(screen.getByText("Sites publicados")).toBeInTheDocument()
    expect(screen.getByText("Briefings enviados")).toBeInTheDocument()
  })
})
