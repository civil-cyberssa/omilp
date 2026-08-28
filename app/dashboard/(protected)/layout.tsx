import DashboardShell from "@/components/dashboard/dashboard-shell"

export default function ProtectedDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
