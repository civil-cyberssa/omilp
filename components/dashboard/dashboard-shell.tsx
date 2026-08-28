"use client"

import Image from "next/image"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { BarChart3, CreditCard, FileText, Files, Gauge, Inbox, Layers3, LogOut, Menu, PanelLeftClose, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthUser, DashboardApiError, dashboardFetcher } from "@/lib/dashboard-api"
import { cn } from "@/lib/utils"

const navigation = [
  { label: "Visão geral", href: "/dashboard", icon: Gauge },
  { label: "Posts", href: "/dashboard/posts", icon: FileText },
  { label: "Ofertas", href: "/dashboard/ofertas", icon: Layers3 },
  { label: "Documentos", href: "/dashboard/documentos", icon: Files },
  { label: "Pedidos", href: "/dashboard/pedidos", icon: CreditCard },
  { label: "Assinaturas", href: "/dashboard/assinaturas", icon: RefreshCw },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
]

function SidebarContent({ close }: { close?: () => void }) {
  const pathname = usePathname()
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(21,94,239,.22),transparent_32%),radial-gradient(circle_at_100%_100%,rgba(208,0,184,.16),transparent_34%)]" />
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={close}>
          <Image src="/logo_perfil.pnng-removebg-preview.png" alt="Omi" width={38} height={38} className="h-9 w-9 object-contain" />
          <div>
            <p className="text-sm font-semibold tracking-wide">Omi Backoffice</p>
            <p className="bg-gradient-to-r from-[#155EEF] via-[#7C2AE8] to-[#D000B8] bg-clip-text text-[10px] font-semibold uppercase tracking-[0.22em] text-transparent">Operação editorial</p>
          </div>
        </Link>
      </div>
      <nav className="relative flex-1 space-y-1 px-3 py-6">
        {navigation.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} onClick={close} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition", active ? "bg-gradient-to-r from-[#155EEF] via-[#4338FF] to-[#7C2AE8] text-white shadow-[0_8px_30px_rgba(67,56,255,.25)]" : "text-white/60 hover:bg-white/[0.06] hover:text-white")}>
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          )
        })}
        <div className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-sm text-white/25">
          <span className="flex items-center gap-3"><Inbox className="h-4 w-4" /> Demandas</span>
          <span className="text-[9px] uppercase tracking-wider">Em breve</span>
        </div>
      </nav>
      <div className="relative border-t border-white/10 p-4 text-[10px] uppercase tracking-[0.18em] text-white/25">Omi Tecnologia · v0.1</div>
    </div>
  )
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: user, error, isLoading } = useSWR<AuthUser, DashboardApiError>("/api/backoffice/me", dashboardFetcher)

  useEffect(() => {
    if (error?.status === 401 || error?.status === 403) router.replace("/dashboard/login")
  }, [error, router])

  async function logout() {
    await signOut({ redirect: false })
    router.replace("/dashboard/login")
    router.refresh()
  }

  if (isLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-[#020617]"><div className="space-y-3"><Skeleton className="h-3 w-36 bg-white/10" /><Skeleton className="h-3 w-24 bg-white/10" /></div></div>
  }

  return (
    <div className="omi-dashboard min-h-screen bg-[linear-gradient(135deg,#FFFFFF_0%,#F5F7FF_55%,#EEE9FF_100%)] text-[#020617]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-black/10 lg:block"><SidebarContent /></aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-0 bg-[#020617] p-0"><SheetTitle className="sr-only">Menu do dashboard</SheetTitle><SidebarContent close={() => setMobileOpen(false)} /></SheetContent>
      </Sheet>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#4338FF]/10 bg-[#F5F7FF]/90 px-5 backdrop-blur-xl md:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu className="h-5 w-5" /></Button>
          <div className="hidden items-center gap-2 text-xs uppercase tracking-[0.2em] text-black/35 lg:flex"><PanelLeftClose className="h-4 w-4" /> Central de conteúdo</div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-medium">{user.full_name}</p><p className="text-xs text-black/45">{user.email}</p></div>
            <Button variant="outline" size="sm" onClick={logout} className="border-black/15 bg-transparent"><LogOut className="mr-2 h-4 w-4" /> Sair</Button>
          </div>
        </header>
        <main className="px-5 py-8 md:px-8 md:py-10 xl:px-12">{children}</main>
      </div>
    </div>
  )
}
