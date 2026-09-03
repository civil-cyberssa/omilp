"use client"

import { CreditCard, RefreshCw } from "lucide-react"
import Link from "next/link"
import useSWR from "swr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cycleLabel, formatMoney } from "@/lib/commerce"
import { PortalData, portalFetcher } from "@/lib/portal"

export function PortalPlans() {
  const { data, error } = useSWR<PortalData>("/api/portal/me", portalFetcher)
  if (!data && !error) return <Skeleton className="mx-auto h-96 max-w-6xl" />
  if (error) return <p className="text-destructive">Não foi possível carregar suas contratações.</p>
  return <div className="mx-auto max-w-6xl space-y-7"><div><p className="text-sm font-medium text-[#155EEF]">Contratações</p><h1 className="mt-1 text-3xl font-semibold">Planos e pedidos</h1><p className="mt-2 text-muted-foreground">Valores, ciclos e andamento das suas contratações.</p></div><div className="grid gap-5 lg:grid-cols-2"><PlanCard title="Planos de assinatura" icon={RefreshCw}>{data!.subscriptions.map((item) => <Contract key={item.id} title={item.offer.name} value={`${formatMoney(item.value)} · ${cycleLabel[item.cycle] ?? item.cycle}`} status={item.status} href={`/area-cliente/briefing?tipo=subscription&id=${item.id}`} />)}</PlanCard><PlanCard title="Pedidos" icon={CreditCard}>{data!.orders.map((item) => <Contract key={item.id} title={item.offer.name} value={formatMoney(item.total)} status={item.status} href={`/area-cliente/briefing?tipo=order&id=${item.id}`} />)}</PlanCard></div></div>
}
function PlanCard({ title, icon: Icon, children }: { title: string; icon: typeof CreditCard; children: React.ReactNode }) { const empty = Array.isArray(children) && children.length === 0; return <Card><CardHeader className="flex-row items-center gap-3"><span className="rounded-full bg-[#4338FF]/10 p-2 text-[#4338FF]"><Icon /></span><CardTitle>{title}</CardTitle></CardHeader><CardContent>{empty ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma contratação.</p> : <div className="divide-y">{children}</div>}</CardContent></Card> }
function Contract({ title, value, status, href }: { title: string; value: string; status: string; href: string }) { return <div className="py-5 first:pt-0 last:pb-0"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-muted-foreground">{value}</p></div><Badge variant="secondary">{status}</Badge></div><Button asChild variant="link" className="mt-2 h-auto p-0 text-[#4338FF]"><Link href={href}>Enviar briefing</Link></Button></div> }
