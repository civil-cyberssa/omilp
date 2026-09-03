import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { PortalAccessForm } from "@/components/portal-access-form"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("PortalAccessForm", () => {
  it("substitui o formulário pela confirmação depois do envio", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({
      detail: "Se o e-mail estiver cadastrado, você receberá o link de acesso.",
    }))
    render(<PortalAccessForm />)

    fireEvent.change(screen.getByLabelText("E-mail usado na contratação"), {
      target: { value: "cliente@example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Enviar link de acesso" }))

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(
      "Se o e-mail estiver cadastrado, enviaremos um link de acesso.",
    ))
    expect(screen.queryByRole("button", { name: "Enviar link de acesso" })).toBeNull()
    expect(screen.queryByLabelText("E-mail usado na contratação")).toBeNull()
  })

  it("mantém o formulário disponível quando o envio falha", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({
      error: { details: { message: "Serviço indisponível." } },
    }, { status: 503 }))
    render(<PortalAccessForm />)

    fireEvent.change(screen.getByLabelText("E-mail usado na contratação"), {
      target: { value: "cliente@example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Enviar link de acesso" }))

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Serviço indisponível."))
    expect(screen.getByRole("button", { name: "Enviar link de acesso" })).toBeInTheDocument()
  })
})
