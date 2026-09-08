"use client"

import Link from "next/link"
import useSWR from "swr"
import { ArrowRight, Banknote, FileText, Plus, ReceiptText, RefreshCw, WalletCards } from "lucide-react"

import { CalendarOverview } from "@/components/dashboard/calendar-overview"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatMoney } from "@/lib/commerce"
import { DashboardBillingOverview, DashboardPost, DashboardSummary, PagedResponse, dashboardFetcher, formatDashboardDate } from "@/lib/dashboard-api"

const statusLabel = { DRAFT: "Rascunho", PUBLISHED: "Publicado", ARCHIVED: "Arquivado" }

export default function DashboardPage() {
  const { data: summary } = useSWR<DashboardSummary>("/api/backoffice/posts/summary", dashboardFetcher)
  const { data: billing, error: billingError } = useSWR<DashboardBillingOverview>("/api/backoffice/billing/overview", dashboardFetcher)
  const { data: posts, error } = useSWR<PagedResponse<DashboardPost>>("/api/backoffice/posts?page_size=5", dashboardFetcher)
  const metrics = billing ? [
    { label: "Pedidos avulsos", value: billing.orders, icon: ReceiptText },
    { label: "Assinaturas", value: billing.subscriptions, icon: RefreshCw },
  ] : []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-[#155EEF]">Visão geral</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Central de operação</h1><p className="mt-2 text-muted-foreground">Acompanhe vendas, saldo, agenda e publicações da Omi.</p></div>
        <Button asChild><Link href="/dashboard/posts/novo"><Plus className="mr-2 h-4 w-4" />Novo post</Link></Button>
      </div>
      {billingError ? <Card><CardContent className="py-8 text-center text-sm text-destructive">Não foi possível carregar o resumo financeiro.</CardContent></Card> : null}
      {!billing && !billingError ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Skeleton className="h-36" /><Skeleton className="h-36" /><Skeleton className="h-36 md:col-span-2" /></div> : null}
      {billing ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => <Card key={label} className="border-[#4338FF]/10 shadow-[0_12px_40px_rgba(67,56,255,.06)]"><CardContent className="flex items-center justify-between p-6"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p></div><span className="rounded-full bg-[#4338FF]/10 p-3 text-[#4338FF]"><Icon className="h-5 w-5" /></span></CardContent></Card>)}
        <Card className="border-[#4338FF]/10 shadow-[0_12px_40px_rgba(67,56,255,.06)] md:col-span-2"><CardContent className="grid h-full gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex items-center gap-2 text-sm text-muted-foreground"><Banknote className="h-4 w-4" />Total faturado</div><p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{formatMoney(billing.revenue)}</p><p className="mt-1 text-xs text-muted-foreground">Pagamentos recebidos e confirmados</p></div><div className="border-t pt-4 sm:min-w-48 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0"><div className="flex items-center gap-2 text-xs text-muted-foreground"><WalletCards className="h-3.5 w-3.5" />Disponível no Asaas</div><p className="mt-2 text-xl font-semibold tabular-nums">{billing.asaas_balance_available && billing.asaas_available_balance !== null ? formatMoney(billing.asaas_available_balance) : "Indisponível"}</p><p className="mt-1 text-[11px] text-muted-foreground">Saldo consultado na conta ativa</p></div></CardContent></Card>
      </div> : null}
      <CalendarOverview />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Posts recentes</CardTitle><p className="mt-1 text-xs text-muted-foreground">{summary ? `${summary.published} publicados · ${summary.draft} rascunhos · ${summary.total_views} acessos` : "Carregando resumo do blog…"}</p></div><Button asChild variant="ghost" size="sm"><Link href="/dashboard/posts">Ver todos <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></CardHeader>
        <CardContent>
          {error ? <p className="py-8 text-center text-sm text-destructive">Não foi possível carregar os posts.</p> : !posts ? <div className="space-y-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-14 w-full" />)}</div> : posts.results.length === 0 ? <div className="py-12 text-center"><FileText className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-medium">Nenhum post criado</p><p className="mt-1 text-sm text-muted-foreground">Seu primeiro documento começa por aqui.</p></div> : <div className="divide-y">{posts.results.map((post) => <Link key={post.id} href={`/dashboard/posts/${post.slug}/editar`} className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-[#4338FF]"><div className="min-w-0"><p className="truncate font-medium">{post.title}</p><p className="mt-1 text-xs text-muted-foreground">Atualizado em {formatDashboardDate(post.updated_at)}</p></div><Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>{statusLabel[post.status]}</Badge></Link>)}</div>}
        </CardContent>
      </Card>
    </div>
  )
}
