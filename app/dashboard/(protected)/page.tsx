"use client"

import Link from "next/link"
import useSWR from "swr"
import { Archive, ArrowRight, Eye, FilePenLine, FileText, Plus, Send } from "lucide-react"

import { CalendarOverview } from "@/components/dashboard/calendar-overview"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardPost, DashboardSummary, PagedResponse, dashboardFetcher, formatDashboardDate } from "@/lib/dashboard-api"

const statusLabel = { DRAFT: "Rascunho", PUBLISHED: "Publicado", ARCHIVED: "Arquivado" }
const viewCountFormatter = new Intl.NumberFormat("pt-BR")

export default function DashboardPage() {
  const { data: summary } = useSWR<DashboardSummary>("/api/backoffice/posts/summary", dashboardFetcher)
  const { data: posts, error } = useSWR<PagedResponse<DashboardPost>>("/api/backoffice/posts?page_size=5", dashboardFetcher)
  const metrics = [
    { label: "Todos os posts", value: summary?.total, icon: FileText },
    { label: "Acessos ao blog", value: summary?.total_views, icon: Eye },
    { label: "Rascunhos", value: summary?.draft, icon: FilePenLine },
    { label: "Publicados", value: summary?.published, icon: Send },
    { label: "Arquivados", value: summary?.archived, icon: Archive },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-[#155EEF]">Visão geral</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Central de operação</h1><p className="mt-2 text-muted-foreground">Acompanhe a agenda e as publicações da Omi.</p></div>
        <Button asChild><Link href="/dashboard/posts/novo"><Plus className="mr-2 h-4 w-4" />Novo post</Link></Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(({ label, value, icon: Icon }) => <Card key={label} className="border-[#4338FF]/10 shadow-[0_12px_40px_rgba(67,56,255,.06)]"><CardContent className="flex items-center justify-between p-6"><div><p className="text-sm text-muted-foreground">{label}</p>{value === undefined ? <Skeleton className="mt-2 h-9 w-14" /> : <p className="mt-1 text-3xl font-semibold">{value}</p>}</div><span className="rounded-full bg-gradient-to-br from-[#155EEF]/10 via-[#7C2AE8]/10 to-[#D000B8]/15 p-3 text-[#4338FF]"><Icon className="h-5 w-5" /></span></CardContent></Card>)}
      </div>
      <CalendarOverview />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Posts recentes</CardTitle><Button asChild variant="ghost" size="sm"><Link href="/dashboard/posts">Ver todos <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></CardHeader>
        <CardContent>
          {error ? <p className="py-8 text-center text-sm text-destructive">Não foi possível carregar os posts.</p> : !posts ? <div className="space-y-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-14 w-full" />)}</div> : posts.results.length === 0 ? <div className="py-12 text-center"><FileText className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-medium">Nenhum post criado</p><p className="mt-1 text-sm text-muted-foreground">Seu primeiro documento começa por aqui.</p></div> : <div className="divide-y">{posts.results.map((post) => <Link key={post.id} href={`/dashboard/posts/${post.slug}/editar`} className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-[#4338FF]"><div className="min-w-0"><p className="truncate font-medium">{post.title}</p><p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground"><span>Atualizado em {formatDashboardDate(post.updated_at)}</span><span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{viewCountFormatter.format(post.view_count)}</span></p></div><Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>{statusLabel[post.status]}</Badge></Link>)}</div>}
        </CardContent>
      </Card>
    </div>
  )
}
