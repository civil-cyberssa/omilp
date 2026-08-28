"use client"

export type AnalyticsEventType = "page_view" | "contact_submit" | "whatsapp_click" | "cta_click"

const UTM_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const

export async function trackAnalyticsEvent(
  eventType: AnalyticsEventType,
  metadata: Record<string, string | number | boolean> = {},
  eventId = crypto.randomUUID(),
) {
  if (typeof window === "undefined" || navigator.doNotTrack === "1") return
  const search = new URLSearchParams(window.location.search)
  const attribution = Object.fromEntries(
    UTM_FIELDS.map((field) => [field, search.get(field)?.slice(0, 200) ?? ""]),
  )
  try {
    await fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: eventId,
        event_type: eventType,
        path: window.location.pathname.slice(0, 500),
        referrer: document.referrer.slice(0, 1000),
        ...attribution,
        metadata,
      }),
      keepalive: true,
    })
  } catch {
    // Analytics nunca deve interromper a experiência principal.
  }
}
