import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import DashboardLoginPage from "@/app/dashboard/login/page"

const replace = vi.fn()
const refresh = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  replace.mockReset()
  refresh.mockReset()
})

describe("login do dashboard", () => {
  it("exibe a mensagem do backend quando as credenciais são inválidas", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      error: {
        status: 401,
        code: "INVALID_CREDENTIALS",
        details: { message: "E-mail ou senha inválidos." },
      },
    }), { status: 401, headers: { "Content-Type": "application/json" } }))

    render(<DashboardLoginPage />)
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "usuario@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "senha-incorreta" },
    })
    fireEvent.click(screen.getByRole("button", { name: /^entrar$/i }))

    expect(await screen.findByText("E-mail ou senha inválidos.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^entrar$/i })).toBeEnabled()
    expect(replace).not.toHaveBeenCalled()
  })
})
