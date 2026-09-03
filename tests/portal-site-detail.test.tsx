import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const mutate = vi.fn()

vi.mock("swr", () => ({
  default: () => ({
    data: {
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
