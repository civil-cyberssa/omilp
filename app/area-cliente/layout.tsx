import { CustomerAreaShell } from "@/components/portal/customer-area-shell"

export default function CustomerAreaLayout({ children }: { children: React.ReactNode }) {
  return <CustomerAreaShell>{children}</CustomerAreaShell>
}
