"use client"

import { ExternalLink, Globe2, Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import useSWR from "swr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardOrder, DashboardProject, DashboardSubscription, PagedResponse, dashboardFetcher, dashboardMutation, formatDashboardDateTime } from "@/lib/dashboard-api"
import { cycleLabel, formatMoney } from "@/lib/commerce"

export function BillingDetail({ type, id }: { type: "orders" | "subscriptions"; id: string }) {
  const { data, error, mutate } = useSWR<DashboardOrder | DashboardSubscription>(`/api/backoffice/${type}/${id}`, dashboardFetcher)
  const projectSource = type === "orders" ? "order" : "subscription"
  const { data: relatedProjects, error: projectsError } = useSWR<PagedResponse<DashboardProject>>(`/api/backoffice/projects?${projectSource}=${id}&page_size=10`, dashboardFetcher)
  const [canceling, setCanceling] = useState(false)
  const [cancelError, setCancelError] = useState("")
  const [limitSaving, setLimitSaving] = useState(false)
  const [limitError, setLimitError] = useState("")
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

  async function saveLimit(formData: FormData) {
    setLimitSaving(true); setLimitError("")
    try {
      await dashboardMutation(`/api/backoffice/${type}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthly_change_request_limit: Number(formData.get("monthly_change_request_limit")) }),
      })
      await mutate()
    } catch (cause) {
      setLimitError(cause instanceof Error ? cause.message : "Não foi possível salvar o limite")
    } finally {
      setLimitSaving(false)
    }
  }

  return <div className="mx-auto max-w-5xl space-y-7">
    <div><p className="text-sm font-medium text-[#155EEF]">Financeiro</p><h1 className="mt-1 text-3xl font-semibold">{isOrder ? "Pedido" : "Assinatura"}</h1><p className="mt-2 font-mono text-xs text-muted-foreground">{data.id}</p></div>
    <div className="grid gap-5 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Contratação</CardTitle></CardHeader><CardContent className="space-y-4"><Row label="Oferta" value={data.offer.name} /><Row label="Valor" value={formatMoney(isOrder ? data.total : data.value)} />{!isOrder ? <Row label="Ciclo" value={cycleLabel[data.cycle] ?? data.cycle} /> : null}<Row label="Criado em" value={formatDashboardDateTime(data.created_at)} />{data.checkout_url ? <a href={data.checkout_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#4338FF]">Abrir checkout <ExternalLink className="h-4 w-4" /></a> : null}</CardContent></Card>
      <Card><CardHeader><CardTitle>Cliente</CardTitle></CardHeader><CardContent className="space-y-4"><Row label="Nome" value={data.customer.name} /><Row label="E-mail" value={data.customer.email} /><Row label="Telefone" value={data.customer.phone || "—"} /><Row label="Empresa" value={data.customer.company || "—"} /></CardContent></Card>
      <Card className="lg:col-span-2"><CardHeader><CardTitle>Status financeiro</CardTitle></CardHeader><CardContent><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><Badge>{data.status}</Badge><p className="mt-3 text-xs text-muted-foreground">O pagamento é atualizado somente pelos webhooks do Asaas.</p></div>{canCancel ? <Button variant="destructive" disabled={canceling} onClick={cancel}>{canceling ? <><Loader2 className="animate-spin" />Cancelando</> : "Cancelar no Asaas"}</Button> : null}</div>{cancelError ? <p className="mt-4 text-sm text-destructive">{cancelError}</p> : null}</CardContent></Card>
      <Card className="lg:col-span-2"><CardHeader><CardTitle>Solicitações de alteração</CardTitle></CardHeader><CardContent><form action={saveLimit} className="flex flex-col gap-3 sm:flex-row sm:items-end"><div className="flex-1 space-y-2"><label htmlFor="monthly_change_request_limit" className="text-sm font-medium">Limite mensal específico</label><input id="monthly_change_request_limit" name="monthly_change_request_limit" type="number" min="0" defaultValue={data.monthly_change_request_limit} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div><Button disabled={limitSaving}>{limitSaving ? <><Loader2 className="animate-spin" />Salvando</> : "Salvar limite"}</Button></form>{limitError ? <p className="mt-3 text-sm text-destructive">{limitError}</p> : null}<p className="mt-3 text-xs text-muted-foreground">Este valor substitui o limite copiado da oferta para esta contratação.</p></CardContent></Card>
      <Card className="lg:col-span-2">
        <CardHeader className="flex-row items-center justify-between gap-4"><div><CardTitle>Projeto relacionado</CardTitle><p className="mt-1 text-sm text-muted-foreground">Site publicado vinculado a esta contratação.</p></div>{relatedProjects?.results.length === 0 ? <Button asChild><Link href={`/dashboard/projetos/novo?type=${projectSource}&id=${id}`}><Plus />Adicionar projeto</Link></Button> : null}</CardHeader>
        <CardContent>{!relatedProjects && !projectsError ? <Skeleton className="h-24" /> : projectsError ? <p className="text-sm text-destructive">Não foi possível carregar o projeto relacionado.</p> : relatedProjects!.results.length === 0 ? <div className="rounded-lg border border-dashed p-8 text-center"><Globe2 className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 text-sm font-medium">Nenhum projeto vinculado</p><p className="mt-1 text-sm text-muted-foreground">Cadastre o endereço do site entregue para este cliente.</p><Button asChild variant="outline" className="mt-5 sm:hidden"><Link href={`/dashboard/projetos/novo?type=${projectSource}&id=${id}`}><Plus />Adicionar projeto</Link></Button></div> : <div className="divide-y">{relatedProjects!.results.map((project) => <div key={project.id} className="flex flex-col justify-between gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"><div className="flex min-w-0 items-center gap-3"><span className="rounded-full bg-primary/10 p-2.5 text-primary"><Globe2 className="h-5 w-5" /></span><div className="min-w-0"><p className="font-medium">{project.offer_name}</p><a href={project.site} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 truncate text-sm text-muted-foreground hover:text-primary">{project.site}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a></div></div><Button asChild variant="outline"><Link href={`/dashboard/projetos/${project.id}`}>Gerenciar projeto</Link></Button></div>)}</div>}</CardContent>
      </Card>
    </div>
  </div>
}

function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 border-b pb-3 last:border-0"><span className="text-sm text-muted-foreground">{label}</span><span className="text-right text-sm font-medium">{value}</span></div> }
