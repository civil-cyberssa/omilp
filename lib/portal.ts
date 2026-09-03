import type { Offer } from "@/lib/commerce"
export type PortalCustomer = { id: string; name: string; email: string; phone: string; company: string }
export type PortalOrder = { id: string; status: string; total: string; due_date: string; checkout_url: string; offer: Offer; created_at: string }
export type PortalSubscription = { id: string; status: string; value: string; cycle: string; next_due_date: string; checkout_url: string; offer: Offer; created_at: string }
export type PortalBriefingExtraData = {
  domain?: { has_domain?: boolean; current?: string; desired_options?: string[] }
  brand_colors?: { unsure?: boolean; name?: string; hex?: string; hexes?: string[] }
  color_to_avoid?: string
}
export type PortalBriefing = {
  id: string
  project_name: string
  business_description: string
  goals: string
  target_audience: string
  visual_references: string
  desired_pages: string[]
  brand_assets_url: string
  extra_data: PortalBriefingExtraData
  status: string
  created_at: string
  updated_at: string
  edited_at: string | null
  subscription: string | null
  order: string | null
}
export type PortalData = { customer: PortalCustomer; orders: PortalOrder[]; subscriptions: PortalSubscription[]; briefings: PortalBriefing[] }

export class PortalRequestError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = "PortalRequestError"
  }
}

export function apiErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback
  const value = payload as {
    detail?: unknown
    error?: { details?: unknown }
  }
  if (typeof value.detail === "string") return value.detail
  const details = value.error?.details
  if (typeof details === "string") return details
  if (details && typeof details === "object") {
    const nested = details as { detail?: unknown; message?: unknown }
    if (typeof nested.detail === "string") return nested.detail
    if (typeof nested.message === "string") return nested.message
  }
  return fallback
}

export const portalFetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" })
  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    throw new PortalRequestError(
      response.status,
      apiErrorMessage(payload, "Não foi possível consultar sua área."),
    )
  }
  return payload as PortalData
}
