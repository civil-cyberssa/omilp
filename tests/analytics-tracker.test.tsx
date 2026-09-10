import { cleanup, render, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  track: vi.fn(),
  initializePixel: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  usePathname: () => "/site-por-assinatura",
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock("@/lib/analytics", () => ({ trackAnalyticsEvent: mocks.track }))
vi.mock("@/lib/meta-pixel", () => ({ initializeMetaPixel: mocks.initializePixel }))

import AnalyticsTracker from "@/components/analytics-tracker"

class VisibleIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = "0px"
  readonly thresholds = [0]

  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(target: Element) {
    this.callback([{ target, isIntersecting: true } as IntersectionObserverEntry], this)
  }

  disconnect() {}
  unobserve() {}
  takeRecords() { return [] }
}

describe("AnalyticsTracker", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", VisibleIntersectionObserver)
    mocks.track.mockResolvedValue(undefined)
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it("rastreia a página, as seções visíveis e os cards de oferta", async () => {
    render(<>
      <AnalyticsTracker />
      <main>
        <section id="planos"><h2>Escolha seu plano</h2></section>
        <article data-analytics-offer="essencial" data-analytics-offer-name="Essencial" />
      </main>
    </>)

    await waitFor(() => expect(mocks.track).toHaveBeenCalledTimes(3))
    expect(mocks.track).toHaveBeenCalledWith("page_view", { page: "/site-por-assinatura" })
    expect(mocks.track).toHaveBeenCalledWith("section_view", {
      section_id: "planos",
      section_name: "Escolha seu plano",
    })
    expect(mocks.track).toHaveBeenCalledWith("offer_view", {
      offer: "essencial",
      offer_name: "Essencial",
    })
  })
})
