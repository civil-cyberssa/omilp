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
  it("mostra dados e ações dos briefings com a data da edição", () => {
    render(<CustomerPortal />)

    expect(screen.getByRole("button", { name: "Meus dados" })).toBeInTheDocument()
    expect(screen.getByText(/Enviado em 27\/08\/2026 · editado em 03\/09\/2026/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Ver briefing Site institucional" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Editar briefing Site institucional" })).toBeInTheDocument()
  })
})
