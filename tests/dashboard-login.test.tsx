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
  vi.unstubAllGlobals()
  replace.mockReset()
  refresh.mockReset()
  signIn.mockReset()
})

describe("login do dashboard", () => {
  it("exibe a opção de manter conectado marcada por padrão", () => {
    render(<DashboardLoginPage />)

    expect(screen.getByRole("checkbox", { name: "Manter conectado" })).toBeChecked()
  })

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

  it("transforma o cookie em sessão do navegador quando a opção é desmarcada", async () => {
    signIn.mockResolvedValue({ ok: true, error: null, status: 200 })
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal("fetch", fetchMock)

    render(<DashboardLoginPage />)
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "usuario@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "senha-correta" },
    })
    fireEvent.click(screen.getByRole("checkbox", { name: "Manter conectado" }))
    fireEvent.click(screen.getByRole("button", { name: /^entrar$/i }))

    expect(await screen.findByRole("button", { name: /^entrar$/i })).toBeEnabled()
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/session-persistence", { method: "POST" })
    expect(replace).toHaveBeenCalledWith("/dashboard")
  })
})
