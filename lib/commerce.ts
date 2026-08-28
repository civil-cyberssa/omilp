export type OfferKind = "SUBSCRIPTION" | "ONE_TIME"
export type Offer = {
  id: string
  name: string
  slug: string
  short_description: string
  description: string
  kind: OfferKind
  price: string
  cycle: string
  features: string[]
  is_featured: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export async function getOffers(): Promise<Offer[]> {
  try {
    const response = await fetch(`${apiUrl}/offers/`, { cache: "no-store" })
    if (!response.ok) return []
    const data: Offer[] | { results: Offer[] } = await response.json()
    return Array.isArray(data) ? data : data.results
  } catch {
    return []
  }
}

export async function getOffer(slug: string): Promise<Offer | null> {
  try {
    const response = await fetch(`${apiUrl}/offers/${encodeURIComponent(slug)}/`, { cache: "no-store" })
    return response.ok ? response.json() : null
  } catch {
    return null
  }
}

export function formatMoney(value: string | number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))
}

export const cycleLabel: Record<string, string> = {
  WEEKLY: "semana", BIWEEKLY: "quinzena", MONTHLY: "mês", BIMONTHLY: "bimestre",
  QUARTERLY: "trimestre", SEMIANNUALLY: "semestre", YEARLY: "ano",
}

export function getOfferPricing(
  offer: Pick<Offer, "kind" | "cycle" | "price">,
) {
  const total = Number(offer.price)
  const isYearly = offer.kind === "SUBSCRIPTION" && offer.cycle === "YEARLY"

  return {
    displayAmount: isYearly ? total / 12 : total,
    displayCycle:
      offer.kind === "SUBSCRIPTION"
        ? isYearly
          ? "mês"
          : cycleLabel[offer.cycle] ?? "período"
        : null,
    annualTotal: isYearly ? total : null,
    isYearly,
  }
}
