import * as React from "react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import WhatsappButton from "../components/whatsapp-button"

let pathname = "/"

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}))

describe("WhatsappButton", () => {
  afterEach(cleanup)

  beforeEach(() => {
    pathname = "/"
  })

  it("renderiza o link do WhatsApp", () => {
    render(<WhatsappButton />)
    const link = screen.getByRole("link", { name: /WhatsApp/i })
    expect(link).toHaveAttribute("href", "https://wa.me/5571992997191")
  })

  it("não aparece nas páginas do dashboard", () => {
    pathname = "/dashboard/documentos"
    render(<WhatsappButton />)

    expect(screen.queryByRole("link", { name: /WhatsApp/i })).not.toBeInTheDocument()
  })
})
