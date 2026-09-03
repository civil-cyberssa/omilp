import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { CustomerDataDialog } from "@/components/customer-data-dialog"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("CustomerDataDialog", () => {
  it("permite ao cliente alterar os próprios dados", async () => {
    const onSaved = vi.fn()
    const updated = {
      id: "customer-1",
      name: "Maria Atualizada",
      email: "maria@example.com",
      phone: "71999999999",
      company: "Omi Cliente",
    }
    const request = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json(updated))
    render(<CustomerDataDialog customer={{ ...updated, name: "Maria" }} onSaved={onSaved} />)

    fireEvent.click(screen.getByRole("button", { name: "Meus dados" }))
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Maria Atualizada" } })
    fireEvent.click(screen.getByRole("button", { name: "Salvar meus dados" }))

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(updated))
    expect(request).toHaveBeenCalledWith(
      "/api/portal/me",
      expect.objectContaining({ method: "PATCH" }),
    )
  })
})
