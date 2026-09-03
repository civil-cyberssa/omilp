import type { Metadata } from "next"

import { CustomerAreaShell } from "@/components/portal/customer-area-shell"

export const metadata: Metadata = {
  title: "Área do cliente",
  robots: { index: false, follow: false },
}

export default function CustomerAreaLayout({ children }: { children: React.ReactNode }) {
  return <CustomerAreaShell>{children}</CustomerAreaShell>
}
