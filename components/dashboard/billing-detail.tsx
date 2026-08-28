"use client"

import { ExternalLink, Loader2 } from "lucide-react"
import { useState } from "react"
import useSWR from "swr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardOrder, DashboardSubscription, dashboardFetcher, dashboardMutation, formatDashboardDateTime } from "@/lib/dashboard-api"
import { cycleLabel, formatMoney } from "@/lib/commerce"

export function BillingDetail({ type, id }: { type: "orders" | "subscriptions"; id: string }) {
  const { data, error, mutate } = useSWR<DashboardOrder | DashboardSubscription>(`/api/backoffice/${type}/${id}`, dashboardFetcher)
  const [canceling, setCanceling] = useState(false)
  const [cancelError, setCancelError] = useState("")
  if (error) return <p className="text-destructive">Registro não encontrado.</p>
  if (!data) return <Skeleton className="mx-auto h-96 max-w-4xl" />
  const isOrder = "total" in data
  const canCancel = isOrder ? ["CREATED", "PENDING_PAYMENT", "ERROR"].includes(data.status) : !["CANCELED", "COMPLETED"].includes(data.status)

  async function cancel() {
    if (!confirm("Confirmar o cancelamento no Asaas? Esta ação pode interromper cobranças futuras.")) return
    setCanceling(true); setCancelError("")
    try { await dashboardMutation(`/api/backoffice/${type}/${id}/cancel`, { method: "POST" }); await mutate() }
    catch (cause) { setCancelError(cause instanceof Error ? cause.message : "Não foi possível cancelar") }
    finally { setCanceling(false) }
  }

  return <div className="mx-auto max-w-5xl space-y-7">
    <div><p className="text-sm font-medium text-[#155EEF]">Financeiro</p><h1 className="mt-1 text-3xl font-semibold">{isOrder ? "Pedido" : "Assinatura"}</h1><p className="mt-2 font-mono text-xs text-muted-foreground">{data.id}</p></div>
    <div className="grid gap-5 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Contratação</CardTitle></CardHeader><CardContent className="space-y-4"><Row label="Oferta" value={data.offer.name} /><Row label="Valor" value={formatMoney(isOrder ? data.total : data.value)} />{!isOrder ? <Row label="Ciclo" value={cycleLabel[data.cycle] ?? data.cycle} /> : null}<Row label="Criado em" value={formatDashboardDateTime(data.created_at)} />{data.checkout_url ? <a href={data.checkout_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#4338FF]">Abrir checkout <ExternalLink className="h-4 w-4" /></a> : null}</CardContent></Card>
      <Card><CardHeader><CardTitle>Cliente</CardTitle></CardHeader><CardContent className="space-y-4"><Row label="Nome" value={data.customer.name} /><Row label="E-mail" value={data.customer.email} /><Row label="Telefone" value={data.customer.phone || "—"} /><Row label="Empresa" value={data.customer.company || "—"} /></CardContent></Card>
      <Card className="lg:col-span-2"><CardHeader><CardTitle>Status financeiro</CardTitle></CardHeader><CardContent><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><Badge>{data.status}</Badge><p className="mt-3 text-xs text-muted-foreground">O pagamento é atualizado somente pelos webhooks do Asaas.</p></div>{canCancel ? <Button variant="destructive" disabled={canceling} onClick={cancel}>{canceling ? <><Loader2 className="animate-spin" />Cancelando</> : "Cancelar no Asaas"}</Button> : null}</div>{cancelError ? <p className="mt-4 text-sm text-destructive">{cancelError}</p> : null}</CardContent></Card>
    </div>
  </div>
}

function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 border-b pb-3 last:border-0"><span className="text-sm text-muted-foreground">{label}</span><span className="text-right text-sm font-medium">{value}</span></div> }
