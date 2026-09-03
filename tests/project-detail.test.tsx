import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  dashboardMutation: vi.fn(),
  mutateProject: vi.fn(),
}))

const project = {
  id: "project-1",
  site: "https://cliente.example.com",
  repository_url: "https://github.com/omi/cliente",
  hosting_provider: "AWS",
  domain_access_url: "https://registro.example.com",
  domain_access_username: "dominio@example.com",
  domain_access_password: "senha-atual",
  notes: "Conta administrada pela equipe.",
  order: "order-1",
  subscription: null,
  customer: { id: "customer-1", name: "Cliente", email: "cliente@example.com", phone: "", company: "", cpf_cnpj: "" },
  offer_name: "Site institucional",
  source_type: "order",
  source_id: "order-1",
  monthly_change_request_limit: 3,
  change_requests_used: 1,
  change_requests_remaining: 2,
  created_at: "2026-09-03T12:00:00Z",
  updated_at: "2026-09-03T12:00:00Z",
}

vi.mock("swr", () => ({
  default: (key: string) => key.startsWith("/api/backoffice/change-requests")
    ? { data: { count: 0, next: null, previous: null, results: [] }, mutate: vi.fn() }
    : { data: project, error: undefined, mutate: mocks.mutateProject },
}))

vi.mock("@/lib/dashboard-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/dashboard-api")>("@/lib/dashboard-api")
  return { ...actual, dashboardMutation: mocks.dashboardMutation }
})

import { ProjectDetail } from "@/components/dashboard/project-detail"

describe("ProjectDetail", () => {
  beforeEach(() => {
    mocks.dashboardMutation.mockResolvedValue(project)
    mocks.mutateProject.mockResolvedValue(project)
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("edita os dados internos de infraestrutura", async () => {
    render(<ProjectDetail id="project-1" />)

    expect(screen.getByText("Somente equipe")).toBeInTheDocument()
    expect(screen.getByLabelText("Repositório")).toHaveValue("https://github.com/omi/cliente")
    expect(screen.getByLabelText("Senha do domínio")).toHaveAttribute("type", "password")
    fireEvent.click(screen.getByRole("button", { name: "Exibir senha" }))
    expect(screen.getByLabelText("Senha do domínio")).toHaveAttribute("type", "text")

    fireEvent.change(screen.getByLabelText("Senha do domínio"), { target: { value: "senha-nova" } })
    fireEvent.click(screen.getByRole("button", { name: "Salvar informações" }))

    await waitFor(() => expect(mocks.dashboardMutation).toHaveBeenCalledTimes(1))
    const request = mocks.dashboardMutation.mock.calls[0][1] as RequestInit
    expect(JSON.parse(String(request.body))).toEqual(expect.objectContaining({
      hosting_provider: "AWS",
      domain_access_password: "senha-nova",
      notes: "Conta administrada pela equipe.",
    }))
  })
})
