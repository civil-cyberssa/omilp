import { redirect } from "next/navigation"

import { auth } from "@/auth"
import DashboardShell from "@/components/dashboard/dashboard-shell"

export default async function ProtectedDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || session.error === "RefreshTokenError") redirect("/dashboard/login")
  return <DashboardShell>{children}</DashboardShell>
}
