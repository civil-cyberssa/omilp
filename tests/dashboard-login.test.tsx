import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import DashboardLoginPage from "@/app/dashboard/login/page"

const replace = vi.fn()
const refresh = vi.fn()
const signIn = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}))
vi.mock("next-auth/react", () => ({ signIn: (...args: unknown[]) => signIn(...args) }))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  replace.mockReset()
  refresh.mockReset()
  signIn.mockReset()
})

describe("login do dashboard", () => {
  it("exibe a mensagem do backend quando as credenciais são inválidas", async () => {
    signIn.mockResolvedValue({ ok: false, error: "CredentialsSignin", status: 401 })

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
    expect(signIn).toHaveBeenCalledWith("credentials", expect.objectContaining({
      email: "usuario@example.com",
      password: "senha-incorreta",
      redirect: false,
    }))
    expect(replace).not.toHaveBeenCalled()
  })
})
