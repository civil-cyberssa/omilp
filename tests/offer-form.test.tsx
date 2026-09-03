import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  dashboardMutation: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}))

vi.mock("sonner", () => ({
  toast: { success: mocks.success, error: mocks.error },
}))

vi.mock("@/lib/dashboard-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/dashboard-api")>("@/lib/dashboard-api")
  return { ...actual, dashboardMutation: mocks.dashboardMutation }
})

import { OfferForm } from "@/components/dashboard/offer-form"
import type { DashboardOffer } from "@/lib/dashboard-api"

const offer: DashboardOffer = {
  id: "offer-1",
  name: "Assinatura",
  slug: "assinatura",
  short_description: "Site por assinatura",
  description: "Descrição",
  kind: "SUBSCRIPTION",
  price: "199.90",
  cycle: "MONTHLY",
  features: ["Hospedagem"],
  is_featured: false,
  is_active: true,
  sort_order: 1,
  monthly_change_request_limit: 2,
  created_at: "2026-09-01T12:00:00Z",
  updated_at: "2026-09-01T12:00:00Z",
}

describe("OfferForm", () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(cleanup)

  it("exibe sucesso e atualiza a página depois da edição", async () => {
    const onSaved = vi.fn().mockResolvedValue(undefined)
    mocks.dashboardMutation.mockResolvedValue({ ...offer, price: "249.90" })
    render(<OfferForm offer={offer} onSaved={onSaved} />)

    fireEvent.change(screen.getByLabelText("Preço"), { target: { value: "249.90" } })
    fireEvent.submit(screen.getByRole("button", { name: "Salvar oferta" }).closest("form")!)

    await waitFor(() => expect(mocks.success).toHaveBeenCalledWith("Oferta atualizada com sucesso."))
    expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ price: "249.90" }))
    expect(mocks.replace).toHaveBeenCalledWith("/dashboard/ofertas/assinatura/editar")
    expect(mocks.refresh).toHaveBeenCalledTimes(1)
  })

  it("exibe erro quando a oferta não é atualizada", async () => {
    mocks.dashboardMutation.mockRejectedValue(new Error("Nome já utilizado"))
    render(<OfferForm offer={offer} />)

    fireEvent.submit(screen.getByRole("button", { name: "Salvar oferta" }).closest("form")!)

    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith(
      "A oferta não foi atualizada.",
      { description: "Nome já utilizado" },
    ))
    expect(mocks.refresh).not.toHaveBeenCalled()
  })
})
