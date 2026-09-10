import type { Metadata } from "next"

import { CheckoutRuntimeErrorTracker } from "@/components/checkout-runtime-error-tracker"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <><CheckoutRuntimeErrorTracker />{children}</>
}
