import * as React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import WhatsappButton from "../components/whatsapp-button"

describe("WhatsappButton", () => {
  it("renderiza o link do WhatsApp", () => {
    render(<WhatsappButton />)
    const link = screen.getByRole("link", { name: /WhatsApp/i })
    expect(link).toHaveAttribute("href", "https://wa.me/5571992997191")
  })
})
