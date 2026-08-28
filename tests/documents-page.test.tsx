import * as React from "react"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  dashboardFetcher: vi.fn(),
  dashboardMutation: vi.fn(),
  mutate: vi.fn(),
}))

vi.mock("swr", () => ({
  default: () => ({
    data: { count: 0, next: null, previous: null, results: [] },
    error: undefined,
    isLoading: false,
    mutate: mocks.mutate,
  }),
}))

vi.mock("@/lib/dashboard-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/dashboard-api")>("@/lib/dashboard-api")
  return {
    ...actual,
    dashboardFetcher: mocks.dashboardFetcher,
    dashboardMutation: mocks.dashboardMutation,
  }
})

import DocumentsPage from "@/app/dashboard/(protected)/documentos/page"

describe("DocumentsPage", () => {
  afterEach(cleanup)

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.dashboardFetcher.mockResolvedValue({ id: "user-1" })
    mocks.dashboardMutation.mockResolvedValue({ id: "document-1" })
    mocks.mutate.mockResolvedValue(undefined)
  })

  it("envia um arquivo arrastado sem depender do input nativo", async () => {
    render(<DocumentsPage />)
    fireEvent.click(screen.getByRole("button", { name: "Novo documento" }))

    const file = new File(["contrato"], "contrato.pdf", { type: "application/pdf" })
    const dropzone = screen.getByText("Arraste seus arquivos para cá").parentElement
    expect(dropzone).not.toBeNull()
    fireEvent.drop(dropzone as HTMLElement, { dataTransfer: { files: [file] } })

    expect(await screen.findByText("contrato.pdf")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Enviar 1 documento" }))

    await waitFor(() => expect(mocks.dashboardMutation).toHaveBeenCalledTimes(1))
    const request = mocks.dashboardMutation.mock.calls[0][1] as RequestInit
    expect(request.body).toBeInstanceOf(FormData)
    expect((request.body as FormData).get("file")).toBe(file)
    expect(screen.queryByText("Selecione pelo menos um arquivo para continuar.")).not.toBeInTheDocument()
  })

  it("permite selecionar múltiplos arquivos", () => {
    render(<DocumentsPage />)
    fireEvent.click(screen.getByRole("button", { name: "Novo documento" }))

    const input = document.querySelector<HTMLInputElement>("#document-file")
    expect(input).not.toBeNull()
    expect(input?.multiple).toBe(true)
  })
})
