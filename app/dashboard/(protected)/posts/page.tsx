"use client"

import Link from "next/link"
import { useDeferredValue, useState } from "react"
import useSWR from "swr"
import { ExternalLink, Eye, FileText, Pencil, Plus, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Category, DashboardPost, PagedResponse, dashboardFetcher, formatDashboardDate } from "@/lib/dashboard-api"

const statusLabel = { DRAFT: "Rascunho", PUBLISHED: "Publicado", ARCHIVED: "Arquivado" }
const viewCountFormatter = new Intl.NumberFormat("pt-BR")

export default function PostsPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [category, setCategory] = useState("all")
  const [page, setPage] = useState(1)
  const deferredSearch = useDeferredValue(search)
  const query = new URLSearchParams({ page: String(page), page_size: "20" })
  if (deferredSearch) query.set("search", deferredSearch)
  if (status !== "all") query.set("status", status)
  if (category !== "all") query.set("category", category)
  const { data, error, isLoading } = useSWR<PagedResponse<DashboardPost>>(`/api/backoffice/posts?${query}`, dashboardFetcher)
  const { data: categories } = useSWR<Category[]>("/api/backoffice/categories", dashboardFetcher)

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#155EEF]">Conteúdo</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Posts</h1><p className="mt-2 text-muted-foreground">Crie, revise e organize o blog da Omi.</p></div><Button asChild><Link href="/dashboard/posts/novo"><Plus className="mr-2 h-4 w-4" />Novo post</Link></Button></div>
      <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_190px_220px]">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Buscar por título, resumo ou conteúdo" className="pl-9" /></div>
        <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os status</SelectItem><SelectItem value="DRAFT">Rascunhos</SelectItem><SelectItem value="PUBLISHED">Publicados</SelectItem><SelectItem value="ARCHIVED">Arquivados</SelectItem></SelectContent></Select>
        <Select value={category} onValueChange={(value) => { setCategory(value); setPage(1) }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as categorias</SelectItem>{categories?.map((item) => <SelectItem key={item.id} value={item.slug}>{item.name}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? <div className="space-y-3 p-6">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-12 w-full" />)}</div> : error ? <div className="py-16 text-center text-sm text-destructive">Não foi possível carregar os posts.</div> : data?.results.length === 0 ? <div className="py-16 text-center"><FileText className="mx-auto h-9 w-9 text-muted-foreground" /><p className="mt-3 font-medium">Nenhum post encontrado</p><p className="mt-1 text-sm text-muted-foreground">Ajuste os filtros ou crie um novo documento.</p></div> : <Table><TableHeader><TableRow><TableHead>Título</TableHead><TableHead className="hidden md:table-cell">Categoria</TableHead><TableHead>Status</TableHead><TableHead className="hidden sm:table-cell text-right">Acessos</TableHead><TableHead className="hidden lg:table-cell">Atualizado</TableHead><TableHead className="w-24 text-right">Ações</TableHead></TableRow></TableHeader><TableBody>{data?.results.map((post) => <TableRow key={post.id}><TableCell><div className="max-w-md"><p className="truncate font-medium">{post.title}</p><p className="truncate text-xs text-muted-foreground">/{post.slug}</p></div></TableCell><TableCell className="hidden md:table-cell">{post.category?.name ?? "—"}</TableCell><TableCell><Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>{statusLabel[post.status]}</Badge></TableCell><TableCell className="hidden sm:table-cell text-right"><span className="inline-flex items-center gap-1.5 font-medium tabular-nums"><Eye className="h-3.5 w-3.5 text-muted-foreground" />{viewCountFormatter.format(post.view_count)}</span></TableCell><TableCell className="hidden lg:table-cell">{formatDashboardDate(post.updated_at)}</TableCell><TableCell><div className="flex justify-end gap-1">{post.status === "PUBLISHED" ? <Button asChild variant="ghost" size="icon"><Link href={`/blog/${post.slug}`} target="_blank" aria-label={`Abrir ${post.title}`}><ExternalLink className="h-4 w-4" /></Link></Button> : null}<Button asChild variant="ghost" size="icon"><Link href={`/dashboard/posts/${post.slug}/editar`} aria-label={`Editar ${post.title}`}><Pencil className="h-4 w-4" /></Link></Button></div></TableCell></TableRow>)}</TableBody></Table>}
        {data && data.count > 20 ? <div className="flex items-center justify-between border-t px-4 py-3"><p className="text-xs text-muted-foreground">{data.count} posts</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={!data.previous} onClick={() => setPage((current) => current - 1)}>Anterior</Button><Button variant="outline" size="sm" disabled={!data.next} onClick={() => setPage((current) => current + 1)}>Próxima</Button></div></div> : null}
      </div>
    </div>
  )
}
