"use client"

import { ExternalLink, Globe2, Plus, Search } from "lucide-react"
import Link from "next/link"
import { useDeferredValue, useState } from "react"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardProject, PagedResponse, dashboardFetcher, formatDashboardDate } from "@/lib/dashboard-api"

export function ProjectList() {
  const [search, setSearch] = useState("")
  const deferred = useDeferredValue(search)
  const query = new URLSearchParams({ page_size: "100" })
  if (deferred) query.set("search", deferred)
  const { data, error } = useSWR<PagedResponse<DashboardProject>>(`/api/backoffice/projects?${query}`, dashboardFetcher)

  return <div className="mx-auto max-w-7xl space-y-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#155EEF]">Operação</p><h1 className="mt-1 text-3xl font-semibold">Projetos</h1><p className="mt-2 text-muted-foreground">Sites publicados e solicitações dos clientes.</p></div><Button asChild><Link href="/dashboard/projetos/novo"><Plus />Novo projeto</Link></Button></div>
    <div className="relative max-w-xl"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cliente, e-mail ou site" className="pl-9" /></div>
    {!data && !error ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[1,2,3].map((item) => <Skeleton key={item} className="h-56" />)}</div> : error ? <p className="rounded-xl border bg-card p-10 text-center text-destructive">Não foi possível carregar os projetos.</p> : data?.results.length === 0 ? <p className="rounded-xl border bg-card p-10 text-center text-muted-foreground">Nenhum projeto cadastrado.</p> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data?.results.map((project) => <Card key={project.id} className="overflow-hidden border-[#4338FF]/10"><CardContent className="p-0"><div className="flex items-center justify-between border-b bg-gradient-to-r from-[#155EEF]/5 to-[#D000B8]/5 p-5"><span className="rounded-full bg-[#4338FF]/10 p-3 text-[#4338FF]"><Globe2 /></span><span className="text-xs text-muted-foreground">{formatDashboardDate(project.created_at)}</span></div><div className="space-y-4 p-5"><div><h2 className="font-semibold">{project.offer_name}</h2><p className="text-sm text-muted-foreground">{project.customer.name}</p></div><a href={project.site} target="_blank" rel="noreferrer" className="flex items-center gap-1 truncate text-sm text-[#4338FF]">{project.site}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a><div className="flex items-center justify-between text-xs text-muted-foreground"><span>{project.change_requests_used}/{project.monthly_change_request_limit} alterações no mês</span><Button asChild variant="ghost" size="sm"><Link href={`/dashboard/projetos/${project.id}`}>Gerenciar</Link></Button></div></div></CardContent></Card>)}</div>}
  </div>
}
