"use client"

import { ExternalLink, Globe2, Loader2, Send } from "lucide-react"
import { useState } from "react"
import useSWR from "swr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { apiErrorMessage, PortalProject, portalFetcher } from "@/lib/portal"

const statusLabels = { PENDING: "Pendente", IN_PROGRESS: "Em andamento", COMPLETED: "Concluída", CANCELED: "Cancelada" }

export function PortalSiteDetail({ id }: { id: string }) {
  const { data: project, error, mutate } = useSWR<PortalProject>(`/api/portal/projects/${id}`, portalFetcher)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState("")
  if (!project && !error) return <Skeleton className="mx-auto h-[680px] max-w-7xl" />
  if (error) return <p className="text-destructive">Projeto não encontrado.</p>

  async function submit(formData: FormData) {
    setSending(true); setMessage("")
    try {
      const response = await fetch(`/api/portal/projects/${id}/change-requests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: formData.get("title"), description: formData.get("description") }) })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) { setMessage(apiErrorMessage(payload, "Não foi possível enviar a solicitação.")); return }
      await mutate()
      setMessage("Solicitação enviada para nossa equipe.")
    } catch {
      setMessage("Não foi possível enviar a solicitação.")
    } finally {
      setSending(false)
    }
  }

  return <div className="mx-auto max-w-7xl space-y-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#155EEF]">Meus sites</p><h1 className="mt-1 text-3xl font-semibold">{project!.offer_name}</h1><p className="mt-2 text-muted-foreground">{project!.site}</p></div><Button asChild variant="outline"><a href={project!.site} target="_blank" rel="noreferrer">Abrir site <ExternalLink /></a></Button></div><div className="overflow-hidden rounded-xl border bg-[#0b1020] shadow-[0_24px_80px_rgba(2,6,23,.18)]"><div className="flex h-12 items-center gap-2 border-b border-white/10 px-4"><span className="h-3 w-3 rounded-full bg-[#ff5f57]" /><span className="h-3 w-3 rounded-full bg-[#febc2e]" /><span className="h-3 w-3 rounded-full bg-[#28c840]" /><div className="mx-auto flex max-w-xl flex-1 items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-xs text-white/55"><Globe2 className="h-3.5 w-3.5" /><span className="truncate">{project!.site}</span></div></div><iframe src={project!.site} title={`Preview de ${project!.offer_name}`} className="h-[62vh] min-h-[440px] w-full bg-white" sandbox="allow-forms allow-popups allow-same-origin allow-scripts" referrerPolicy="no-referrer" /></div><div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><Card><CardHeader><CardTitle>Nova solicitação</CardTitle></CardHeader><CardContent><div className="mb-5 rounded-lg bg-[#4338FF]/5 p-4"><p className="text-3xl font-semibold text-[#4338FF]">{project!.change_requests_remaining}</p><p className="text-sm text-muted-foreground">de {project!.monthly_change_request_limit} alterações restantes neste mês</p></div><form action={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="request-title">Título</Label><Input id="request-title" name="title" required maxLength={160} placeholder="Ex.: atualizar telefone" /></div><div className="space-y-2"><Label htmlFor="request-description">O que precisa mudar?</Label><Textarea id="request-description" name="description" required rows={6} placeholder="Descreva a alteração e onde ela deve aparecer." /></div>{message ? <p role="status" className="text-sm text-[#4338FF]">{message}</p> : null}<Button className="w-full" disabled={sending || project!.change_requests_remaining === 0}>{sending ? <><Loader2 className="animate-spin" />Enviando</> : <><Send />Enviar solicitação</>}</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Histórico de solicitações</CardTitle></CardHeader><CardContent>{project!.change_requests.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma solicitação enviada.</p> : <div className="divide-y">{project!.change_requests.map((request) => <div key={request.id} className="py-5 first:pt-0 last:pb-0"><div className="flex items-start justify-between gap-3"><h3 className="font-medium">{request.title}</h3><Badge variant="secondary">{statusLabels[request.status]}</Badge></div><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{request.description}</p><p className="mt-2 text-xs text-muted-foreground">{new Date(request.created_at).toLocaleDateString("pt-BR")}</p></div>)}</div>}</CardContent></Card></div></div>
}
