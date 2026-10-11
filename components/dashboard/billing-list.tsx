"use client"

import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import Link from "next/link"
import { useDeferredValue, useState } from "react"
import useSWR from "swr"

import { ManualOrderDialog } from "@/components/dashboard/manual-order-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardOrder, DashboardSubscription, PagedResponse, dashboardFetcher, formatDashboardDate, formatDashboardDateTime } from "@/lib/dashboard-api"
import { formatMoney } from "@/lib/commerce"

const labels: Record<string, string> = {
  CREATED: "Criado", PENDING_PAYMENT: "Aguardando", PAID: "Pago", CANCELED: "Cancelado",
  REFUNDED: "Estornado", ERROR: "Erro", PENDING: "Pendente", ACTIVE: "Ativa",
  OVERDUE: "Inadimplente", PAUSED: "Pausada", COMPLETED: "Concluída",
}

export function BillingList({ type }: { type: "orders" | "subscriptions" }) {
  const isOrders = type === "orders"
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState("10")
  const deferred = useDeferredValue(search)
  const query = new URLSearchParams({
    page: String(page),
    page_size: pageSize,
  })
  if (deferred) query.set("search", deferred)
  if (status !== "all") query.set("status", status)
  const { data, error, isLoading, mutate } = useSWR<PagedResponse<DashboardOrder | DashboardSubscription>>(`/api/backoffice/${type}?${query}`, dashboardFetcher)
  const { data: billingSummary, mutate: mutateBillingSummary } = useSWR<{ total: number }>(
    `/api/backoffice/${type}/summary`,
    dashboardFetcher,
  )
  const totalPages = data ? Math.max(1, Math.ceil(data.count / Number(pageSize))) : 1
  const firstResult = data?.count ? (page - 1) * Number(pageSize) + 1 : 0
  const lastResult = data?.count ? Math.min(page * Number(pageSize), data.count) : 0
  const statuses = isOrders
    ? [["PENDING_PAYMENT", "Aguardando"], ["PAID", "Pago"], ["CANCELED", "Cancelado"], ["REFUNDED", "Estornado"]]
    : [["PENDING", "Pendente"], ["ACTIVE", "Ativa"], ["OVERDUE", "Inadimplente"], ["PAUSED", "Pausada"], ["CANCELED", "Cancelada"]]
  const resourceLabel = isOrders ? "pedido" : "assinatura"

  return <div className="mx-auto max-w-7xl space-y-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-sm font-medium text-[#155EEF]">Financeiro</p><div className="mt-1 flex flex-wrap items-baseline gap-3"><h1 className="text-3xl font-semibold">{isOrders ? "Pedidos" : "Assinaturas"}</h1><span className="text-sm font-medium tabular-nums text-muted-foreground">{billingSummary ? `${billingSummary.total} ${resourceLabel}${billingSummary.total === 1 ? "" : "s"}` : "Carregando total…"}</span></div><p className="mt-2 text-muted-foreground">Acompanhe clientes, ofertas e status financeiros.</p></div>
      <ManualOrderDialog onCreated={() => { void mutate(); if (isOrders) void mutateBillingSummary() }} />
    </div>
    <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_220px]">
      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Cliente, e-mail ou oferta" className="pl-9" /></div>
      <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os status</SelectItem>{statuses.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
    </div>
    <div className="overflow-hidden rounded-xl border bg-card">
      {isLoading ? <div className="space-y-3 p-6">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-12" />)}</div>
        : error ? <p className="p-12 text-center text-destructive">Não foi possível carregar.</p>
          : <Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Oferta</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead>Criado</TableHead><TableHead /></TableRow></TableHeader><TableBody>{data?.results.map((item) => <TableRow key={item.id}><TableCell>{item.customer ? <><p className="font-medium">{item.customer.name}</p><p className="text-xs text-muted-foreground">{item.customer.email}</p></> : <p className="text-sm text-muted-foreground">Aguardando preenchimento</p>}</TableCell><TableCell>{item.offer.name}</TableCell><TableCell>{formatMoney("total" in item ? item.total : item.value)}</TableCell><TableCell><Badge variant={["PAID", "ACTIVE"].includes(item.status) ? "default" : "secondary"}>{labels[item.status] ?? item.status}</Badge></TableCell><TableCell>{isOrders ? formatDashboardDateTime(item.created_at) : formatDashboardDate(item.created_at)}</TableCell><TableCell><Button asChild variant="ghost" size="sm"><Link href={`/dashboard/${isOrders ? "pedidos" : "assinaturas"}/${item.id}`}>Detalhes</Link></Button></TableCell></TableRow>)}</TableBody></Table>}
      {data ? <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs tabular-nums text-muted-foreground">Exibindo {firstResult}–{lastResult} de {data.count} {resourceLabel}{data.count === 1 ? "" : "s"}</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Itens por página</span><Select value={pageSize} onValueChange={(value) => { setPageSize(value); setPage(1) }}><SelectTrigger className="h-8 w-[76px]" aria-label="Itens por página"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="50">50</SelectItem><SelectItem value="100">100</SelectItem></SelectContent></Select></div>
          <span className="min-w-24 text-center text-xs tabular-nums text-muted-foreground">Página {page} de {totalPages}</span>
          <div className="flex gap-1"><Button variant="outline" size="icon" className="h-8 w-8" aria-label="Página anterior" disabled={!data.previous} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft className="h-4 w-4" /></Button><Button variant="outline" size="icon" className="h-8 w-8" aria-label="Próxima página" disabled={!data.next} onClick={() => setPage((current) => current + 1)}><ChevronRight className="h-4 w-4" /></Button></div>
        </div>
      </div> : null}
    </div>
  </div>
}
