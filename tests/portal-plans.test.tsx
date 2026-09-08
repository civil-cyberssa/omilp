import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  success: vi.fn(),
}))

vi.mock("sonner", () => ({ toast: { success: mocks.success } }))
vi.mock("swr", () => ({
  default: () => ({
    data: {
      customer: { id: "customer-1", name: "Cliente", email: "cliente@example.com", phone: "", company: "" },
      orders: [],
      subscriptions: [{
        id: "subscription-1",
        status: "ACTIVE",
        value: "199.90",
        cycle: "MONTHLY",
        next_due_date: "2026-10-03",
        checkout_url: "",
        created_at: "2026-09-01T12:00:00Z",
        offer: { id: "offer-1", name: "Site institucional", slug: "site", short_description: "Site", description: "", kind: "SUBSCRIPTION", price: "199.90", cycle: "MONTHLY", features: [], is_featured: false, is_active: true, sort_order: 1, created_at: "2026-09-01T12:00:00Z", updated_at: "2026-09-01T12:00:00Z" },
      }],
      projects: [],
      briefings: [],
    },
    error: undefined,
    mutate: mocks.mutate,
  }),
}))

import { PortalPlans } from "@/components/portal/portal-plans"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  mocks.mutate.mockReset()
  mocks.success.mockReset()
})

describe("PortalPlans", () => {
  it("permite ao cliente cancelar sua assinatura", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true)
    const request = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ status: "CANCELED" }))
    render(<PortalPlans />)

    fireEvent.click(screen.getByRole("button", { name: "Cancelar assinatura" }))

    await waitFor(() => expect(request).toHaveBeenCalledWith(
      "/api/portal/subscriptions/subscription-1/cancel",
      expect.objectContaining({ method: "POST", cache: "no-store" }),
    ))
    expect(mocks.mutate).toHaveBeenCalledOnce()
    expect(mocks.success).toHaveBeenCalledOnce()
  })
})
