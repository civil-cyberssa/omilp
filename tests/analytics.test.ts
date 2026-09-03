import { afterEach, describe, expect, it, vi } from "vitest"

import { trackAnalyticsEvent } from "@/lib/analytics"
import { initializeMetaPixel } from "@/lib/meta-pixel"

describe("analytics da landing page", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.history.replaceState({}, "", "/")
    Object.defineProperty(navigator, "doNotTrack", { value: null, configurable: true })
    sessionStorage.clear()
    delete window.fbq
    delete window._fbq
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
      source_url: "http://localhost:3000/?utm_source=google&utm_medium=cpc&utm_campaign=sites-agosto&utm_term=site",
      metadata: { page: "home" },
    })
    expect(payload).not.toHaveProperty("email")
    expect(request[1]).toMatchObject({ method: "POST", keepalive: true })
  })

  it("preserva a campanha do Instagram nos eventos seguintes", async () => {
    window.history.replaceState({}, "", "/site-por-assinatura?utm_source=instagram&utm_medium=paid_social&utm_campaign=site_por_assinatura_5_dias")
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ accepted: true }))
    await trackAnalyticsEvent("page_view")

    window.history.replaceState({}, "", "/contratar/site-essencial")
    await trackAnalyticsEvent("initiate_checkout", { value: 299, currency: "BRL" })

    const payload = JSON.parse(String(fetchMock.mock.calls[1][1]?.body))
    expect(payload).toMatchObject({
      utm_source: "instagram",
      utm_medium: "paid_social",
      utm_campaign: "site_por_assinatura_5_dias",
    })
  })

  it("usa o mesmo ID no Pixel e na Conversions API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ accepted: true }))
    vi.spyOn(document.head, "appendChild").mockImplementation((node) => node)
    initializeMetaPixel()

    await trackAnalyticsEvent("contact_submit", { form: "contact" }, "ddcd3c0d-24c9-4fc8-bc1c-a3fc100f6578")

    expect(window.fbq?.queue).toContainEqual(["init", "1744943553413898"])
    expect(window.fbq?.queue).toContainEqual([
      "track",
      "Lead",
      { form: "contact" },
      { eventID: "ddcd3c0d-24c9-4fc8-bc1c-a3fc100f6578" },
    ])
    const payload = JSON.parse(String(fetchMock.mock.calls[0][1]?.body))
    expect(payload.event_id).toBe("ddcd3c0d-24c9-4fc8-bc1c-a3fc100f6578")
  })

  it("respeita Do Not Track", async () => {
    Object.defineProperty(navigator, "doNotTrack", { value: "1", configurable: true })
    const fetchMock = vi.spyOn(globalThis, "fetch")

    await trackAnalyticsEvent("page_view")

    expect(fetchMock).not.toHaveBeenCalled()
  })
})
