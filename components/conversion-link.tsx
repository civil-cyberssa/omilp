"use client"

import Link from "next/link"
import type { ComponentProps, ReactNode } from "react"

import { trackAnalyticsEvent, type AnalyticsEventType } from "@/lib/analytics"

type ConversionLinkProps = Omit<ComponentProps<typeof Link>, "children" | "href"> & {
  children: ReactNode
  event: Extract<AnalyticsEventType, "cta_click" | "whatsapp_click">
  eventData: Record<string, string | number | boolean | string[]>
  href: string
}

export function ConversionLink({ children, event, eventData, href, ...props }: ConversionLinkProps) {
  return (
    <Link
      href={href}
      onClick={() => void trackAnalyticsEvent(event, eventData)}
      {...props}
    >
      {children}
    </Link>
  )
}
