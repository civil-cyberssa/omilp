"use client"

import { CreditCard, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cycleLabel, formatMoney } from "@/lib/commerce"
import { PortalData, PortalSubscription, portalFetcher, portalMutation } from "@/lib/portal"

const terminalSubscriptionStatuses = new Set(["CANCELED", "COMPLETED"])

export function PortalPlans() {
  const { data, error, mutate } = useSWR<PortalData>("/api/portal/me", portalFetcher)
  const [cancelingId, setCancelingId] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState("")

  async function cancelSubscription(subscription: PortalSubscription) {
    if (!confirm("Cancelar esta assinatura? As cobranças futuras serão interrompidas e os pagamentos já concluídos serão preservados.")) return
    setCancelingId(subscription.id)
    setCancelError("")
    try {
      await portalMutation(`/api/portal/subscriptions/${subscription.id}/cancel`, {
        method: "POST",
      })
      await mutate()
      toast.success("Assinatura cancelada. As cobranças futuras foram interrompidas.")
    } catch (cause) {
      setCancelError(cause instanceof Error ? cause.message : "Não foi possível cancelar a assinatura.")
    } finally {
      setCancelingId(null)
    }
  }

  if (!data && !error) return <Skeleton className="mx-auto h-96 max-w-6xl" />
  if (error) return <p className="text-destructive">Não foi possível carregar suas contratações.</p>

  return <div className="mx-auto max-w-6xl space-y-7">
    <div><p className="text-sm font-medium text-[#155EEF]">Contratações</p><h1 className="mt-1 text-3xl font-semibold">Planos e pedidos</h1><p className="mt-2 text-muted-foreground">Valores, ciclos e andamento das suas contratações.</p></div>
    {cancelError ? <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{cancelError}</p> : null}
    <div className="grid gap-5 lg:grid-cols-2">
      <PlanCard title="Planos de assinatura" icon={RefreshCw}>
        {data!.subscriptions.map((item) => <Contract
          key={item.id}
          title={item.offer.name}
          value={`${formatMoney(item.value)} · ${cycleLabel[item.cycle] ?? item.cycle}`}
          status={item.status}
          href={`/area-cliente/briefing?tipo=subscription&id=${item.id}`}
          onCancel={terminalSubscriptionStatuses.has(item.status) ? undefined : () => cancelSubscription(item)}
          canceling={cancelingId === item.id}
        />)}
      </PlanCard>
      <PlanCard title="Pedidos" icon={CreditCard}>
        {data!.orders.map((item) => <Contract key={item.id} title={item.offer.name} value={formatMoney(item.total)} status={item.status} href={`/area-cliente/briefing?tipo=order&id=${item.id}`} />)}
      </PlanCard>
    </div>
  </div>
}

function PlanCard({ title, icon: Icon, children }: { title: string; icon: typeof CreditCard; children: React.ReactNode }) {
  const empty = Array.isArray(children) && children.length === 0
  return <Card><CardHeader className="flex-row items-center gap-3"><span className="rounded-full bg-[#4338FF]/10 p-2 text-[#4338FF]"><Icon /></span><CardTitle>{title}</CardTitle></CardHeader><CardContent>{empty ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma contratação.</p> : <div className="divide-y">{children}</div>}</CardContent></Card>
}

function Contract({ title, value, status, href, onCancel, canceling = false }: { title: string; value: string; status: string; href: string; onCancel?: () => void; canceling?: boolean }) {
  return <div className="py-5 first:pt-0 last:pb-0">
    <div className="flex items-start justify-between gap-3"><div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-muted-foreground">{value}</p></div><Badge variant="secondary">{status}</Badge></div>
    <div className="mt-3 flex flex-wrap items-center gap-4">
      <Button asChild variant="link" className="h-auto p-0 text-[#4338FF]"><Link href={href}>Enviar briefing</Link></Button>
      {onCancel ? <Button type="button" variant="link" className="h-auto p-0 text-destructive" disabled={canceling} onClick={onCancel}>{canceling ? <><Loader2 className="animate-spin" />Cancelando</> : "Cancelar assinatura"}</Button> : null}
    </div>
  </div>
}
