import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const mutate = vi.fn()

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }))

vi.mock("swr", () => ({
  default: (key: string) => ({
    data: key === "/api/portal/me" ? {
      customer: { id: "customer-1", name: "Cliente", email: "cliente@example.com", phone: "", company: "" },
      orders: [],
      subscriptions: [{
        id: "subscription-1",
        status: "ACTIVE",
        value: "199.90",
        cycle: "MONTHLY",
        next_due_date: "2026-10-03",
        checkout_url: "",
        created_at: "2026-09-01T12:00:00Z",
        offer: { id: "offer-1", name: "Site institucional", slug: "site", short_description: "Presença digital completa", description: "", kind: "SUBSCRIPTION", price: "199.90", cycle: "MONTHLY", features: ["Hospedagem"], is_featured: false, is_active: true, sort_order: 1, created_at: "2026-09-01T12:00:00Z", updated_at: "2026-09-01T12:00:00Z" },
      }],
      projects: [],
      briefings: [],
    } : {
      id: "project-1",
      site: "about:blank",
      offer_name: "Site institucional",
      source_type: "subscription",
      source_id: "subscription-1",
      monthly_change_request_limit: 3,
      change_requests_used: 1,
      change_requests_remaining: 2,
      change_requests: [],
      created_at: "2026-09-01T12:00:00Z",
      updated_at: "2026-09-01T12:00:00Z",
    },
    error: undefined,
    mutate,
  }),
}))

import { PortalSiteDetail } from "@/components/portal/portal-site-detail"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  mutate.mockReset()
})

describe("PortalSiteDetail", () => {
  it("mostra o preview e envia uma solicitação consumindo o limite", async () => {
    const request = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ id: "request-1" }, { status: 201 }))
    render(<PortalSiteDetail id="project-1" />)

    expect(screen.getByTitle("Preview de Site institucional")).toHaveAttribute("src", "about:blank")
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getByText(/199,90/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Nova alteração" }))
    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Trocar telefone" } })
    fireEvent.change(screen.getByLabelText("O que precisa mudar?"), { target: { value: "Atualizar o rodapé." } })
    fireEvent.click(screen.getByRole("button", { name: "Enviar solicitação" }))

    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1))
    expect(request).toHaveBeenCalledWith(
      "/api/portal/projects/project-1/change-requests",
      expect.objectContaining({ method: "POST" }),
    )
  })
})
