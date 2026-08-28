import { afterEach, describe, expect, it, vi } from "vitest"

import { trackAnalyticsEvent } from "@/lib/analytics"

describe("analytics da landing page", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.history.replaceState({}, "", "/")
    Object.defineProperty(navigator, "doNotTrack", { value: null, configurable: true })
  })

  it("envia UTMs e metadados sem incluir dados pessoais", async () => {
    window.history.replaceState(
      {},
      "",
      "/?utm_source=google&utm_medium=cpc&utm_campaign=sites-agosto&utm_term=site",
    )
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ accepted: true }))

    await trackAnalyticsEvent("page_view", { page: "home" })

    const request = fetchMock.mock.calls[0]
    const payload = JSON.parse(String(request[1]?.body))
    expect(request[0]).toBe("/api/analytics/events")
    expect(payload).toMatchObject({
      event_type: "page_view",
      path: "/",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "sites-agosto",
      utm_term: "site",
      metadata: { page: "home" },
    })
    expect(payload).not.toHaveProperty("email")
    expect(request[1]).toMatchObject({ method: "POST", keepalive: true })
  })

  it("respeita Do Not Track", async () => {
    Object.defineProperty(navigator, "doNotTrack", { value: "1", configurable: true })
    const fetchMock = vi.spyOn(globalThis, "fetch")

    await trackAnalyticsEvent("page_view")

    expect(fetchMock).not.toHaveBeenCalled()
  })
})
