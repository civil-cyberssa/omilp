"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ClipboardList, CreditCard, Gauge, Globe2, Headphones, LogOut, Menu, UserRound } from "lucide-react"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { PortalData, PortalRequestError, portalFetcher } from "@/lib/portal"

const navigation = [
  { label: "Dashboard", href: "/area-cliente", icon: Gauge },
  { label: "Briefings", href: "/area-cliente/briefings", icon: ClipboardList },
  { label: "Planos de assinatura", href: "/area-cliente/planos", icon: CreditCard },
  { label: "Meu perfil", href: "/area-cliente/perfil", icon: UserRound },
  { label: "Meus sites", href: "/area-cliente/sites", icon: Globe2 },
]

function PortalSidebar({ close, logout }: { close?: () => void; logout: () => void }) {
  const pathname = usePathname()
  return <div className="relative flex h-full flex-col overflow-hidden bg-[#020617] text-white"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(21,94,239,.24),transparent_34%),radial-gradient(circle_at_100%_100%,rgba(208,0,184,.14),transparent_36%)]" /><div className="relative flex h-20 items-center border-b border-white/10 px-6"><Link href="/area-cliente" onClick={close} className="flex items-center gap-3"><Image src="/logo_perfil.pnng-removebg-preview.png" alt="Omi" width={38} height={38} className="h-9 w-9 object-contain" /><div><p className="text-sm font-semibold tracking-wide">Minha Omi</p><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#8EA8FF]">Central do cliente</p></div></Link></div><nav className="relative flex-1 space-y-1 px-3 py-6">{navigation.map((item) => { const active = item.href === "/area-cliente" ? pathname === item.href : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} onClick={close} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition", active ? "bg-gradient-to-r from-[#155EEF] via-[#4338FF] to-[#7C2AE8] text-white shadow-[0_8px_30px_rgba(67,56,255,.25)]" : "text-white/60 hover:bg-white/[.06] hover:text-white")}><item.icon className="h-4 w-4" />{item.label}</Link> })}</nav><div className="relative space-y-2 border-t border-white/10 p-4"><Button asChild variant="outline" className="w-full border-white/15 bg-white/[.04] text-white hover:bg-white/10 hover:text-white"><a href="https://wa.me/71992997191" target="_blank" rel="noreferrer"><Headphones />Suporte</a></Button><Button variant="ghost" onClick={logout} className="w-full justify-start text-white/55 hover:bg-white/[.06] hover:text-white"><LogOut />Sair</Button></div></div>
}

export function CustomerAreaShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const publicRoute = pathname === "/area-cliente/entrar" || pathname === "/area-cliente/acesso"
  const { error } = useSWR<PortalData>(publicRoute ? null : "/api/portal/me", portalFetcher)
  const sessionInvalid = error instanceof PortalRequestError && [401, 403].includes(error.status)
  useEffect(() => { if (sessionInvalid) window.location.replace("/area-cliente/entrar") }, [sessionInvalid])
  if (publicRoute) return children

  async function logout() {
    await fetch("/api/portal/logout", { method: "POST" })
    router.replace("/area-cliente/entrar")
    router.refresh()
  }

  return <div className="min-h-screen bg-[linear-gradient(135deg,#fff_0%,#f5f7ff_55%,#eee9ff_100%)] text-[#020617]"><aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-black/10 lg:block"><PortalSidebar logout={logout} /></aside><Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetContent side="left" className="w-72 border-0 bg-[#020617] p-0"><SheetTitle className="sr-only">Menu da área do cliente</SheetTitle><PortalSidebar close={() => setMobileOpen(false)} logout={logout} /></SheetContent></Sheet><div className="lg:pl-64"><header className="sticky top-0 z-30 flex h-20 items-center border-b border-[#4338FF]/10 bg-[#f5f7ff]/90 px-5 backdrop-blur-xl md:px-8"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu /></Button><p className="ml-3 text-xs font-semibold uppercase tracking-[.2em] text-black/35 lg:ml-0">Área do cliente</p><Button asChild variant="ghost" size="sm" className="ml-auto text-[#4338FF]"><a href="https://wa.me/71992997191" target="_blank" rel="noreferrer"><Headphones />Suporte</a></Button></header><main className="px-5 py-8 md:px-8 md:py-10 xl:px-12">{children}</main></div></div>
}
