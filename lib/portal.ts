import type { Offer } from "@/lib/commerce"
export type PortalCustomer = { id: string; name: string; email: string; phone: string; company: string }
export type PortalOrder = { id: string; status: string; total: string; due_date: string; checkout_url: string; offer: Offer; created_at: string }
export type PortalSubscription = { id: string; status: string; value: string; cycle: string; next_due_date: string; checkout_url: string; offer: Offer; created_at: string }
export type PortalBriefing = { id: string; project_name: string; status: string; created_at: string; subscription: string | null; order: string | null }
export type PortalData = { customer: PortalCustomer; orders: PortalOrder[]; subscriptions: PortalSubscription[]; briefings: PortalBriefing[] }
export const portalFetcher = async (url: string) => { const response = await fetch(url, { cache: "no-store" }); if (!response.ok) throw new Error(String(response.status)); return response.json() }
