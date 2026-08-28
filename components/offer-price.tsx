import type { Offer } from "@/lib/commerce"
import { formatMoney, getOfferPricing } from "@/lib/commerce"
import { cn } from "@/lib/utils"

type OfferPriceProps = {
  offer: Pick<Offer, "kind" | "cycle" | "price">
  className?: string
}

export function OfferPrice({ offer, className }: OfferPriceProps) {
  const pricing = getOfferPricing(offer)

  return (
    <div className={cn("mt-8", className)}>
      <p className="text-4xl font-semibold tracking-[-.045em]">
        {formatMoney(pricing.displayAmount)}
        {pricing.displayCycle ? (
          <span className="ml-1 text-sm font-normal tracking-normal text-white/45">
            / {pricing.displayCycle}
          </span>
        ) : null}
      </p>
      {pricing.annualTotal !== null ? (
        <p className="mt-2 text-xs leading-5 text-white/48">
          Total anual de {formatMoney(pricing.annualTotal)}, cobrado pelo valor integral do plano.
        </p>
      ) : null}
    </div>
  )
}
