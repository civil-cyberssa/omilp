import { StrictMode } from "react"
import { cleanup, render, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const replace = vi.fn()
const refresh = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}))

import { PortalExchange } from "@/components/portal-exchange"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  replace.mockReset()
  refresh.mockReset()
})

describe("PortalExchange", () => {
  it("troca um link de uso único somente uma vez no Strict Mode", async () => {
    const request = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ authenticated: true }),
    )

    render(
      <StrictMode>
        <PortalExchange token="magic-token" />
      </StrictMode>,
    )

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/area-cliente"))
    expect(request).toHaveBeenCalledTimes(1)
    expect(refresh).toHaveBeenCalledTimes(1)
  })
})
