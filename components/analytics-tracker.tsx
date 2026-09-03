"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

import { trackAnalyticsEvent } from "@/lib/analytics"
import { initializeMetaPixel } from "@/lib/meta-pixel"

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.toString()

  useEffect(() => {
    if (["/dashboard", "/area-cliente", "/briefing"].some((prefix) => pathname.startsWith(prefix))) return
    initializeMetaPixel()
    void trackAnalyticsEvent("page_view", { page: pathname })
  }, [pathname, query])

  return null
}
