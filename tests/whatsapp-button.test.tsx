import { render, screen } from "@testing-library/react"
import WhatsappButton from "../components/whatsapp-button"
import "@testing-library/jest-dom"

describe("WhatsappButton", () => {
  it("renderiza o link do WhatsApp", () => {
    render(<WhatsappButton />)
    const link = screen.getByRole("link", { name: /WhatsApp/i })
    expect(link).toHaveAttribute("href", "https://wa.me/5571987180570")
  })
})
