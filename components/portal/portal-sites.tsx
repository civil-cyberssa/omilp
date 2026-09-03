"use client"

import { ArrowRight, ExternalLink, Globe2 } from "lucide-react"
import Link from "next/link"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PortalProject, portalFetcher } from "@/lib/portal"

export function PortalSites() {
  const { data, error } = useSWR<PortalProject[]>("/api/portal/projects", portalFetcher)
  return <div className="mx-auto max-w-6xl space-y-7"><div><p className="text-sm font-medium text-[#155EEF]">Projetos</p><h1 className="mt-1 text-3xl font-semibold">Meus sites</h1><p className="mt-2 text-muted-foreground">Visualize seus sites e solicite alterações mensais.</p></div>{!data && !error ? <div className="grid gap-5 md:grid-cols-2">{[1,2].map((item) => <Skeleton key={item} className="h-64" />)}</div> : error ? <p className="text-destructive">Não foi possível carregar seus sites.</p> : data?.length === 0 ? <Card><CardContent className="py-16 text-center"><Globe2 className="mx-auto text-muted-foreground" /><p className="mt-3 text-muted-foreground">Nenhum site publicado ainda.</p></CardContent></Card> : <div className="grid gap-5 md:grid-cols-2">{data?.map((project) => <Card key={project.id} className="overflow-hidden border-[#4338FF]/10"><div className="h-2 bg-gradient-to-r from-[#155EEF] via-[#4338FF] to-[#D000B8]" /><CardContent className="space-y-5 p-6"><div className="flex items-start justify-between gap-4"><span className="rounded-full bg-[#4338FF]/10 p-3 text-[#4338FF]"><Globe2 /></span><p className="text-right text-sm"><strong className="text-2xl">{project.change_requests_remaining}</strong><br /><span className="text-xs text-muted-foreground">alterações restantes</span></p></div><div><h2 className="text-xl font-semibold">{project.offer_name}</h2><a href={project.site} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 truncate text-sm text-[#4338FF]">{project.site}<ExternalLink className="h-3.5 w-3.5" /></a></div><Button asChild className="w-full"><Link href={`/area-cliente/sites/${project.id}`}>Abrir projeto <ArrowRight /></Link></Button></CardContent></Card>)}</div>}</div>
}
