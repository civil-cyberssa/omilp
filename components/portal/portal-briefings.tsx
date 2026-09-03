"use client"

import { ClipboardList } from "lucide-react"
import useSWR from "swr"

import { BriefingActions } from "@/components/briefing-actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PortalData, portalFetcher } from "@/lib/portal"

const labels: Record<string, string> = { RECEIVED: "Recebido", REVIEWING: "Em análise", APPROVED: "Aprovado", IN_PROGRESS: "Em produção", COMPLETED: "Concluído" }

export function PortalBriefings() {
  const { data, error, mutate } = useSWR<PortalData>("/api/portal/me", portalFetcher)
  return <div className="mx-auto max-w-6xl space-y-7"><div><p className="text-sm font-medium text-[#155EEF]">Projetos</p><h1 className="mt-1 text-3xl font-semibold">Briefings</h1><p className="mt-2 text-muted-foreground">Consulte e atualize as informações enviadas à nossa equipe.</p></div>{!data && !error ? <Skeleton className="h-64" /> : error ? <p className="rounded-xl border bg-card p-10 text-center text-destructive">Não foi possível carregar os briefings.</p> : data?.briefings.length === 0 ? <Card><CardContent className="py-16 text-center"><ClipboardList className="mx-auto text-muted-foreground" /><p className="mt-3 text-muted-foreground">Nenhum briefing enviado.</p></CardContent></Card> : <Card><CardContent className="divide-y p-6">{data?.briefings.map((briefing) => <div key={briefing.id} className="flex flex-col justify-between gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-medium">{briefing.project_name}</h2><Badge variant="secondary">{labels[briefing.status] ?? briefing.status}</Badge></div><p className="mt-2 text-xs text-muted-foreground">Enviado em {new Date(briefing.created_at).toLocaleDateString("pt-BR")}{briefing.edited_at ? <> · editado em {new Date(briefing.edited_at).toLocaleDateString("pt-BR")}</> : null}</p></div><BriefingActions briefing={briefing} onSaved={() => void mutate()} /></div>)}</CardContent></Card>}</div>
}
