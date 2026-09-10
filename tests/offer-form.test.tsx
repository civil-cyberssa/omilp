import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  dashboardMutation: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  dashboardFetcher: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}))

vi.mock("sonner", () => ({
  toast: { success: mocks.success, error: mocks.error },
}))

vi.mock("@/lib/dashboard-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/dashboard-api")>("@/lib/dashboard-api")
  return { ...actual, dashboardFetcher: mocks.dashboardFetcher, dashboardMutation: mocks.dashboardMutation }
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

  it("exibe sucesso e volta para a listagem depois da edição", async () => {
    const onSaved = vi.fn().mockResolvedValue(undefined)
    mocks.dashboardMutation.mockResolvedValue({ ...offer, price: "249.90" })
    render(<OfferForm offer={offer} onSaved={onSaved} />)

    expect(screen.getByLabelText("Preço")).toHaveValue("R$\u00a0199,90")
    fireEvent.change(screen.getByLabelText("Preço"), { target: { value: "249.90" } })
    fireEvent.submit(screen.getByRole("button", { name: "Salvar oferta" }).closest("form")!)

    await waitFor(() => expect(mocks.success).toHaveBeenCalledWith("Oferta atualizada com sucesso."))
    const request = mocks.dashboardMutation.mock.calls[0][1]
    expect(JSON.parse(String(request.body))).toEqual(expect.objectContaining({ price: "249.90" }))
    expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ price: "249.90" }))
    expect(mocks.replace).toHaveBeenCalledWith("/dashboard/ofertas")
    expect(mocks.refresh).toHaveBeenCalledTimes(1)
  })

  it("exibe sucesso e volta para a listagem depois da exclusão", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true)
    mocks.dashboardMutation.mockResolvedValue(undefined)
    render(<OfferForm offer={offer} />)

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }))

    await waitFor(() => expect(mocks.success).toHaveBeenCalledWith("Oferta excluída com sucesso."))
    expect(mocks.dashboardMutation).toHaveBeenCalledWith(
      "/api/backoffice/offers/assinatura",
      { method: "DELETE" },
    )
    expect(mocks.replace).toHaveBeenCalledWith("/dashboard/ofertas")
    expect(mocks.refresh).toHaveBeenCalledTimes(1)
  })

  it("aplica máscara financeira enquanto o preço é digitado", () => {
    render(<OfferForm />)

    const price = screen.getByLabelText("Preço")
    fireEvent.change(price, { target: { value: "123456" } })

    expect(price).toHaveValue("R$\u00a01.234,56")
  })

  it("preenche uma nova oferta a partir de outra oferta selecionada", async () => {
    const sourceOffer = {
      ...offer,
      id: "offer-source",
      name: "Plano anual",
      slug: "plano-anual",
      short_description: "Resumo copiado",
      description: "Descrição copiada",
      price: "1200.00",
      cycle: "YEARLY",
      features: ["Hospedagem", "Suporte"],
      is_featured: true,
      is_active: false,
      sort_order: 7,
      monthly_change_request_limit: 5,
    }
    mocks.dashboardFetcher.mockResolvedValue({ count: 1, next: null, previous: null, results: [sourceOffer] })
    render(<OfferForm />)

    fireEvent.click(screen.getByRole("switch", { name: "Preencher oferta a partir de outra" }))
    expect(await screen.findByRole("combobox", { name: "Oferta a copiar" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("combobox", { name: "Oferta a copiar" }))
    fireEvent.click(await screen.findByRole("option", { name: "Plano anual · Assinatura" }))

    expect(screen.getByLabelText("Nome")).toHaveValue("Plano anual")
    expect(screen.getByLabelText("Slug")).toHaveValue("plano-anual")
    expect(screen.getByLabelText("Resumo")).toHaveValue("Resumo copiado")
    expect(screen.getByLabelText("Descrição")).toHaveValue("Descrição copiada")
    expect(screen.getByLabelText("Preço")).toHaveValue("R$\u00a01.200,00")
    expect(screen.getByLabelText("Ordem")).toHaveValue(7)
    expect(screen.getByLabelText("Alterações permitidas por mês")).toHaveValue(5)
    expect(screen.getByLabelText("Benefícios (um por linha)")).toHaveValue("Hospedagem\nSuporte")
    expect(screen.getByRole("combobox", { name: "Tipo" })).toHaveTextContent("Assinatura")
    expect(screen.getByRole("combobox", { name: "Ciclo" })).toHaveTextContent("Anual")
    expect(screen.getByRole("switch", { name: "Oferta ativa" })).not.toBeChecked()
    expect(screen.getByRole("switch", { name: "Em destaque" })).toBeChecked()

    mocks.dashboardMutation.mockResolvedValue({ ...sourceOffer, id: "new-offer" })
    fireEvent.submit(screen.getByRole("button", { name: "Salvar oferta" }).closest("form")!)

    await waitFor(() => expect(mocks.dashboardMutation).toHaveBeenCalledWith(
      "/api/backoffice/offers",
      expect.objectContaining({ method: "POST" }),
    ))
    expect(JSON.parse(String(mocks.dashboardMutation.mock.calls[0][1].body))).toEqual(expect.objectContaining({
      name: "Plano anual",
      slug: "plano-anual",
      price: "1200.00",
      cycle: "YEARLY",
      features: ["Hospedagem", "Suporte"],
      is_active: false,
      is_featured: true,
    }))
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

  it("exibe o código retornado pela API quando a exclusão falha", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true)
    const message = "Erro 400 · VALIDATION_ERROR: Esta oferta possui cobranças vinculadas."
    mocks.dashboardMutation.mockRejectedValue(new Error(message))
    render(<OfferForm offer={offer} />)

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }))

    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith(
      "A oferta não foi excluída.",
      { description: message },
    ))
    expect(screen.getByText(message)).toBeInTheDocument()
    expect(mocks.replace).not.toHaveBeenCalled()
  })
})
