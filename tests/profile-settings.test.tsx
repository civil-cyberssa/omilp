import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ProfileSettings } from "@/components/dashboard/profile-settings"

const { mutateGoogle, mutateUser, replace, toastSuccess, useSWR } = vi.hoisted(() => ({
  mutateGoogle: vi.fn(),
  mutateUser: vi.fn(),
  replace: vi.fn(),
  toastSuccess: vi.fn(),
  useSWR: vi.fn(),
}))

vi.mock("swr", () => ({ default: useSWR }))
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh: vi.fn() }),
}))
vi.mock("next-auth/react", () => ({ signOut: vi.fn() }))
vi.mock("sonner", () => ({
  toast: { success: toastSuccess, error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

const user = {
  id: "user-1",
  email: "pessoa@omi.test",
  first_name: "Pessoa",
  last_name: "Omi",
  full_name: "Pessoa Omi",
  phone: "71999999999",
}

beforeEach(() => {
  mutateUser.mockResolvedValue(undefined)
  mutateGoogle.mockResolvedValue(undefined)
  useSWR.mockImplementation((key: string) => (
    key === "/api/backoffice/me"
      ? { data: user, error: undefined, mutate: mutateUser }
      : {
          data: {
            configured: true,
            connected: true,
            calendar_name: "Agenda principal",
            last_synced_at: "2026-10-11T12:00:00Z",
          },
          error: undefined,
          mutate: mutateGoogle,
        }
  ))
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  useSWR.mockReset()
  mutateUser.mockReset()
  mutateGoogle.mockReset()
  replace.mockReset()
  toastSuccess.mockReset()
})

describe("meu perfil do dashboard", () => {
  it("atualiza as informações do usuário autenticado", async () => {
    const updatedUser = { ...user, first_name: "Marina", full_name: "Marina Omi" }
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify(updatedUser),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ))

    render(<ProfileSettings />)
    const firstName = await screen.findByLabelText("Nome")
    fireEvent.change(firstName, { target: { value: "Marina" } })
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/backoffice/me",
      expect.objectContaining({ method: "PATCH" }),
    ))
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toMatchObject({
      first_name: "Marina",
      email: user.email,
    })
    expect(mutateUser).toHaveBeenCalledWith(updatedUser, { revalidate: false })
  })

  it("sincroniza uma agenda Google conectada", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({
        imported: 2,
        updated: 1,
        deleted: 0,
        exported: 1,
        failed: 0,
        last_synced_at: "2026-10-11T13:00:00Z",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ))

    render(<ProfileSettings />)
    fireEvent.click(await screen.findByRole("button", { name: /sincronizar agora/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/backoffice/calendar/google/sync",
      expect.objectContaining({ method: "POST" }),
    ))
    expect(mutateGoogle).toHaveBeenCalled()
    expect(toastSuccess).toHaveBeenCalledWith("Agenda atualizada com 4 mudanças.")
  })
})
