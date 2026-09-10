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

    const tracked = new Set<Element>()
    const sectionMetadata = new Map<Element, { section_id: string; section_name: string }>()
    const offerMetadata = new Map<Element, { offer: string; offer_name: string }>()
    const sections = Array.from(document.querySelectorAll("main section"))

    sections.forEach((section, index) => {
      const heading = section.querySelector("h1, h2, h3")?.textContent?.trim().slice(0, 160)
      const ariaLabel = section.getAttribute("aria-label")?.trim().slice(0, 160)
      const sectionName = ariaLabel || heading || section.id || `Seção ${index + 1}`
      sectionMetadata.set(section, {
        section_id: (section.id || sectionName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `section-${index + 1}`).slice(0, 160),
        section_name: sectionName,
      })
    })

    document.querySelectorAll<HTMLElement>("[data-analytics-offer]").forEach((offer) => {
      const offerSlug = offer.dataset.analyticsOffer?.slice(0, 160)
      if (!offerSlug) return
      offerMetadata.set(offer, {
        offer: offerSlug,
        offer_name: (offer.dataset.analyticsOfferName || offerSlug).slice(0, 160),
      })
    })

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || tracked.has(entry.target)) return
        tracked.add(entry.target)
        observer.unobserve(entry.target)

        const offer = offerMetadata.get(entry.target)
        if (offer) {
          void trackAnalyticsEvent("offer_view", offer)
          return
        }
        const section = sectionMetadata.get(entry.target)
        if (section) void trackAnalyticsEvent("section_view", section)
      })
    }, { rootMargin: "-25% 0px -25% 0px", threshold: 0 })

    sectionMetadata.forEach((_, section) => observer.observe(section))
    offerMetadata.forEach((_, offer) => observer.observe(offer))
    return () => observer.disconnect()
  }, [pathname, query])

  return null
}
