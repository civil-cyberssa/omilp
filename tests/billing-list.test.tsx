import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  useSWR: vi.fn(),
  mutate: vi.fn(),
}))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/components/dashboard/manual-order-dialog", () => ({
  ManualOrderDialog: () => <button type="button">Novo pedido</button>,
}))

import { BillingList } from "@/components/dashboard/billing-list"

describe("BillingList de pedidos", () => {
  beforeEach(() => {
    mocks.mutate.mockResolvedValue(undefined)
    mocks.useSWR.mockImplementation((key: string | null) => {
      if (key === "/api/backoffice/orders/summary") {
        return { data: { total: 237 }, mutate: mocks.mutate }
      }
      if (key === "/api/backoffice/subscriptions/summary") {
        return { data: { total: 82 }, mutate: mocks.mutate }
      }
      if (key?.startsWith("/api/backoffice/subscriptions?")) {
        return {
          data: { count: 62, next: "/subscriptions?page=2", previous: null, results: [] },
          error: undefined,
          isLoading: false,
          mutate: mocks.mutate,
        }
      }
      return {
        data: { count: 37, next: "/orders?page=2", previous: null, results: [] },
        error: undefined,
        isLoading: false,
        mutate: mocks.mutate,
      }
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("exibe o total e pagina os pedidos com tamanho configurável", async () => {
    render(<BillingList type="orders" />)

    expect(screen.getByText("237 pedidos")).toBeInTheDocument()
    expect(screen.getByText("Exibindo 1–10 de 37 pedidos")).toBeInTheDocument()
    expect(screen.getByText("Página 1 de 4")).toBeInTheDocument()
    expect(mocks.useSWR).toHaveBeenCalledWith(
      "/api/backoffice/orders?page=1&page_size=10",
      expect.any(Function),
    )

    fireEvent.click(screen.getByRole("button", { name: "Próxima página" }))
    await waitFor(() => expect(mocks.useSWR).toHaveBeenCalledWith(
      "/api/backoffice/orders?page=2&page_size=10",
      expect.any(Function),
    ))

    fireEvent.click(screen.getByRole("combobox", { name: "Itens por página" }))
    expect(await screen.findByRole("option", { name: "10" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "50" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "100" })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("option", { name: "50" }))

    await waitFor(() => expect(mocks.useSWR).toHaveBeenCalledWith(
      "/api/backoffice/orders?page=1&page_size=50",
      expect.any(Function),
    ))
  })

  it("exibe o total e pagina as assinaturas com tamanho configurável", async () => {
    render(<BillingList type="subscriptions" />)

    expect(screen.getByText("82 assinaturas")).toBeInTheDocument()
    expect(screen.getByText("Exibindo 1–10 de 62 assinaturas")).toBeInTheDocument()
    expect(screen.getByText("Página 1 de 7")).toBeInTheDocument()
    expect(mocks.useSWR).toHaveBeenCalledWith(
      "/api/backoffice/subscriptions?page=1&page_size=10",
      expect.any(Function),
    )

    fireEvent.click(screen.getByRole("button", { name: "Próxima página" }))
    await waitFor(() => expect(mocks.useSWR).toHaveBeenCalledWith(
      "/api/backoffice/subscriptions?page=2&page_size=10",
      expect.any(Function),
    ))

    fireEvent.click(screen.getByRole("combobox", { name: "Itens por página" }))
    fireEvent.click(await screen.findByRole("option", { name: "100" }))
    await waitFor(() => expect(mocks.useSWR).toHaveBeenCalledWith(
      "/api/backoffice/subscriptions?page=1&page_size=100",
      expect.any(Function),
    ))
  })
})
