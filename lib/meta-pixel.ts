"use client"

type MetaPixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void
  queue: unknown[][]
  loaded: boolean
  version: string
}

declare global {
  interface Window {
    fbq?: MetaPixelFunction
    _fbq?: MetaPixelFunction
  }
}

const META_EVENT_NAMES = {
  page_view: "PageView",
  contact_submit: "Lead",
  whatsapp_click: "Contact",
  cta_click: "ViewContent",
  initiate_checkout: "InitiateCheckout",
  purchase: "Purchase",
} as const

export type MetaEventType = keyof typeof META_EVENT_NAMES

export function initializeMetaPixel() {
  if (typeof window === "undefined" || navigator.doNotTrack === "1" || window.fbq) return
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1744943553413898"
  if (!pixelId) return

  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args)
    else fbq.queue.push(args)
  } as MetaPixelFunction
  fbq.queue = []
  fbq.loaded = true
  fbq.version = "2.0"
  window.fbq = fbq
  window._fbq = fbq

  const script = document.createElement("script")
  script.async = true
  script.src = "https://connect.facebook.net/en_US/fbevents.js"
  document.head.appendChild(script)
  fbq("init", pixelId)
}

export function trackMetaPixelEvent(
  eventType: MetaEventType,
  eventId: string,
  metadata: Record<string, string | number | boolean | string[]>,
) {
  const eventName = META_EVENT_NAMES[eventType]
  if (!window.fbq || !eventName) return
  window.fbq("track", eventName, metadata, { eventID: eventId })
}
