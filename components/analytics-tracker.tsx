"use client"

import { useEffect, useState } from "react"

import { trackAnalyticsEvent } from "@/lib/analytics"

export default function AnalyticsTracker() {
  const [eventId] = useState(() => crypto.randomUUID())

  useEffect(() => {
    void trackAnalyticsEvent("page_view", { page: "home" }, eventId)
  }, [eventId])

  return null
}
