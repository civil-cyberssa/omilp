"use client"

import type { ReactNode } from "react"
import { useState } from "react"

import { cn } from "@/lib/utils"

type BillingCycle = "MONTHLY" | "YEARLY"

type BillingCycleSelectorProps = {
  monthly: ReactNode
  yearly: ReactNode
  hasMonthly: boolean
  hasYearly: boolean
  className?: string
}

const options: Array<{ value: BillingCycle; label: string }> = [
  { value: "MONTHLY", label: "Mensal" },
  { value: "YEARLY", label: "Anual" },
]

export function BillingCycleSelector({
  monthly,
  yearly,
  hasMonthly,
  hasYearly,
  className,
}: BillingCycleSelectorProps) {
  const [cycle, setCycle] = useState<BillingCycle>(hasYearly ? "YEARLY" : "MONTHLY")
  const available = { MONTHLY: hasMonthly, YEARLY: hasYearly }

  return (
    <div className={className}>
      <div className="flex justify-center">
        <div
          role="radiogroup"
          aria-label="Ciclo de cobrança"
          className="inline-grid grid-cols-2 rounded-full border border-white/12 bg-white/[.055] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-sm"
        >
          {options.map((option) => {
            const selected = cycle === option.value
            const enabled = available[option.value]

            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!enabled}
                onClick={() => setCycle(option.value)}
                className={cn(
                  "min-w-28 rounded-full px-5 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ea8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050711]",
                  selected
                    ? "bg-white text-[#11182a] shadow-[0_8px_24px_rgba(0,0,0,.22)]"
                    : "text-white/58 hover:text-white",
                  !enabled && "cursor-not-allowed opacity-35 hover:text-white/58",
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div role="tabpanel" aria-label={`Planos com cobrança ${cycle === "MONTHLY" ? "mensal" : "anual"}`}>
        {cycle === "MONTHLY" ? monthly : yearly}
      </div>
    </div>
  )
}
