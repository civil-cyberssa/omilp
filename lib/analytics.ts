"use client"

import { trackMetaPixelEvent, type MetaEventType } from "@/lib/meta-pixel"

export type AnalyticsEventType = MetaEventType

const UTM_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const
const ATTRIBUTION_KEY = "omi_campaign_attribution"

function campaignAttribution() {
  const search = new URLSearchParams(window.location.search)
  const current = Object.fromEntries(
    UTM_FIELDS.map((field) => [field, search.get(field)?.slice(0, 200) ?? ""]),
  )
  try {
    if (Object.values(current).some(Boolean)) {
      sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(current))
      return current
    }
    const stored = JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY) ?? "null")
    if (stored && typeof stored === "object") {
      return Object.fromEntries(
        UTM_FIELDS.map((field) => [field, typeof stored[field] === "string" ? stored[field].slice(0, 200) : ""]),
      )
    }
  } catch {
    // Storage pode estar indisponível em modos de privacidade mais restritivos.
  }
  return current
}

function cookieValue(name: string) {
  const prefix = `${name}=`
  return document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix))?.slice(prefix.length) ?? ""
}

function facebookClickId() {
  const cookie = cookieValue("_fbc")
  if (cookie) return cookie.slice(0, 255)
  const clickId = new URLSearchParams(window.location.search).get("fbclid")
  return clickId ? `fb.1.${Date.now()}.${clickId}`.slice(0, 255) : ""
}

export async function trackAnalyticsEvent(
  eventType: AnalyticsEventType,
  metadata: Record<string, string | number | boolean | string[]> = {},
  eventId = crypto.randomUUID(),
) {
  if (typeof window === "undefined" || navigator.doNotTrack === "1") return
  const attribution = campaignAttribution()
  trackMetaPixelEvent(eventType, eventId, metadata)
  try {
    await fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: eventId,
        event_type: eventType,
        path: window.location.pathname.slice(0, 500),
        referrer: document.referrer.slice(0, 1000),
        source_url: window.location.href.slice(0, 1000),
        fbp: cookieValue("_fbp").slice(0, 255),
        fbc: facebookClickId(),
        ...attribution,
        metadata,
      }),
      keepalive: true,
    })
  } catch {
    // Analytics nunca deve interromper a experiência principal.
  }
}
