"use client"

import { Search } from "lucide-react"
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
import { DashboardOrder, DashboardSubscription, PagedResponse, dashboardFetcher, formatDashboardDate } from "@/lib/dashboard-api"
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
  const deferred = useDeferredValue(search)
  const query = new URLSearchParams({ page_size: "50" })
  if (deferred) query.set("search", deferred)
  if (status !== "all") query.set("status", status)
  const { data, error, isLoading, mutate } = useSWR<PagedResponse<DashboardOrder | DashboardSubscription>>(`/api/backoffice/${type}?${query}`, dashboardFetcher)
  const statuses = isOrders
    ? [["PENDING_PAYMENT", "Aguardando"], ["PAID", "Pago"], ["CANCELED", "Cancelado"], ["REFUNDED", "Estornado"]]
    : [["PENDING", "Pendente"], ["ACTIVE", "Ativa"], ["OVERDUE", "Inadimplente"], ["PAUSED", "Pausada"], ["CANCELED", "Cancelada"]]

  return <div className="mx-auto max-w-7xl space-y-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-sm font-medium text-[#155EEF]">Financeiro</p><h1 className="mt-1 text-3xl font-semibold">{isOrders ? "Pedidos" : "Assinaturas"}</h1><p className="mt-2 text-muted-foreground">Acompanhe clientes, ofertas e status financeiros.</p></div>
      <ManualOrderDialog onCreated={() => { void mutate() }} />
    </div>
    <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_220px]">
      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cliente, e-mail ou oferta" className="pl-9" /></div>
      <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os status</SelectItem>{statuses.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
    </div>
    <div className="overflow-hidden rounded-xl border bg-card">
      {isLoading ? <div className="space-y-3 p-6">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-12" />)}</div>
        : error ? <p className="p-12 text-center text-destructive">Não foi possível carregar.</p>
          : <Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Oferta</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead>Criado</TableHead><TableHead /></TableRow></TableHeader><TableBody>{data?.results.map((item) => <TableRow key={item.id}><TableCell>{item.customer ? <><p className="font-medium">{item.customer.name}</p><p className="text-xs text-muted-foreground">{item.customer.email}</p></> : <p className="text-sm text-muted-foreground">Aguardando preenchimento</p>}</TableCell><TableCell>{item.offer.name}</TableCell><TableCell>{formatMoney("total" in item ? item.total : item.value)}</TableCell><TableCell><Badge variant={["PAID", "ACTIVE"].includes(item.status) ? "default" : "secondary"}>{labels[item.status] ?? item.status}</Badge></TableCell><TableCell>{formatDashboardDate(item.created_at)}</TableCell><TableCell><Button asChild variant="ghost" size="sm"><Link href={`/dashboard/${isOrders ? "pedidos" : "assinaturas"}/${item.id}`}>Detalhes</Link></Button></TableCell></TableRow>)}</TableBody></Table>}
    </div>
  </div>
}
