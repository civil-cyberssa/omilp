"use client"

import { CalendarDays, CreditCard, ExternalLink, Globe2, Loader2, Plus, Send } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cycleLabel, formatMoney } from "@/lib/commerce"
import { apiErrorMessage, PortalData, PortalProject, portalFetcher } from "@/lib/portal"

const requestStatusLabels = { PENDING: "Pendente", IN_PROGRESS: "Em andamento", COMPLETED: "Concluída", CANCELED: "Cancelada" }
const contractStatusLabels: Record<string, string> = { CREATED: "Criado", PENDING_PAYMENT: "Aguardando pagamento", PAID: "Pago", ACTIVE: "Ativa", OVERDUE: "Inadimplente", PAUSED: "Pausada", CANCELED: "Cancelada", COMPLETED: "Concluída" }

export function PortalSiteDetail({ id }: { id: string }) {
  const { data: project, error, mutate } = useSWR<PortalProject>(`/api/portal/projects/${id}`, portalFetcher)
  const { data: portalData } = useSWR<PortalData>("/api/portal/me", portalFetcher)
  const [requestOpen, setRequestOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState("")

  if (!project && !error) return <Skeleton className="mx-auto h-[680px] max-w-7xl" />
  if (error) return <p className="text-destructive">Projeto não encontrado.</p>

  const subscription = project!.source_type === "subscription" ? portalData?.subscriptions?.find((item) => item.id === project!.source_id) : undefined
  const order = project!.source_type === "order" ? portalData?.orders?.find((item) => item.id === project!.source_id) : undefined

  async function submit(formData: FormData) {
    setSending(true); setMessage("")
    try {
      const response = await fetch(`/api/portal/projects/${id}/change-requests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: formData.get("title"), description: formData.get("description") }) })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) { setMessage(apiErrorMessage(payload, "Não foi possível enviar a solicitação.")); return }
      await mutate()
      setRequestOpen(false)
      toast.success("Solicitação enviada para nossa equipe.")
    } catch {
      setMessage("Não foi possível enviar a solicitação.")
    } finally {
      setSending(false)
    }
  }

  return <div className="mx-auto max-w-7xl space-y-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#155EEF]">Meus sites</p><h1 className="mt-1 text-3xl font-semibold">{project!.offer_name}</h1><p className="mt-2 text-muted-foreground">{project!.site}</p></div><Button asChild variant="outline"><a href={project!.site} target="_blank" rel="noreferrer">Abrir site <ExternalLink /></a></Button></div>

    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,.7fr)]">
      <SitePreview project={project!} />
      <ContractSummary project={project!} subscription={subscription} order={order} />
    </div>

    <Card>
      <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><div><CardTitle>Histórico de solicitações</CardTitle><p className="mt-1 text-sm text-muted-foreground">Acompanhe todas as alterações solicitadas para este site.</p></div><Dialog open={requestOpen} onOpenChange={(open) => { setRequestOpen(open); if (!open) setMessage("") }}><DialogTrigger asChild><Button disabled={project!.change_requests_remaining === 0}><Plus />Nova alteração</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Solicitar alteração no site</DialogTitle><DialogDescription>Descreva com clareza o que precisa ser atualizado. Esta solicitação consumirá uma alteração do limite mensal.</DialogDescription></DialogHeader><form action={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="request-title">Título</Label><Input id="request-title" name="title" required maxLength={160} placeholder="Ex.: atualizar telefone" /></div><div className="space-y-2"><Label htmlFor="request-description">O que precisa mudar?</Label><Textarea id="request-description" name="description" required rows={6} placeholder="Descreva a alteração e onde ela deve aparecer." /></div>{message ? <p role="alert" className="text-sm text-destructive">{message}</p> : null}<DialogFooter><Button disabled={sending}>{sending ? <><Loader2 className="animate-spin" />Enviando</> : <><Send />Enviar solicitação</>}</Button></DialogFooter></form></DialogContent></Dialog></CardHeader>
      <CardContent>{project!.change_requests.length === 0 ? <div className="rounded-lg border border-dashed py-12 text-center"><p className="text-sm font-medium">Nenhuma solicitação enviada</p><p className="mt-1 text-sm text-muted-foreground">Quando precisar de um ajuste, use o botão “Nova alteração”.</p></div> : <div className="divide-y">{project!.change_requests.map((request) => <div key={request.id} className="grid gap-3 py-5 first:pt-0 last:pb-0 md:grid-cols-[1fr_auto]"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-medium">{request.title}</h3><Badge variant="secondary">{requestStatusLabels[request.status]}</Badge></div><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{request.description}</p></div><p className="text-xs text-muted-foreground md:text-right">{new Date(request.created_at).toLocaleDateString("pt-BR")}</p></div>)}</div>}</CardContent>
    </Card>
  </div>
}

function SitePreview({ project }: { project: PortalProject }) {
  return <div className="overflow-hidden rounded-xl border bg-[#0b1020] shadow-[0_24px_80px_rgba(2,6,23,.18)]"><div className="flex h-12 items-center gap-2 border-b border-white/10 px-4"><span className="h-3 w-3 rounded-full bg-[#ff5f57]" /><span className="h-3 w-3 rounded-full bg-[#febc2e]" /><span className="h-3 w-3 rounded-full bg-[#28c840]" /><div className="mx-auto flex max-w-xl flex-1 items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-xs text-white/55"><Globe2 className="h-3.5 w-3.5" /><span className="truncate">{project.site}</span></div></div><iframe src={project.site} title={`Preview de ${project.offer_name}`} className="h-[58vh] min-h-[430px] w-full bg-white" sandbox="allow-forms allow-popups allow-same-origin allow-scripts" referrerPolicy="no-referrer" /></div>
}

function ContractSummary({ project, subscription, order }: { project: PortalProject; subscription: PortalData["subscriptions"][number] | undefined; order: PortalData["orders"][number] | undefined }) {
  const isSubscription = project.source_type === "subscription"
  const contract = subscription ?? order
  const amount = subscription?.value ?? order?.total
  const dueDate = subscription?.next_due_date ?? order?.due_date
  return <Card className="overflow-hidden"><div className="bg-[linear-gradient(135deg,#07112d,#172a68)] p-6 text-white"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-white/10 p-2.5"><CreditCard className="h-5 w-5" /></span><Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">{isSubscription ? "Assinatura" : "Pedido"}</Badge></div><p className="mt-7 text-xs font-semibold uppercase tracking-[.18em] text-white/50">Plano contratado</p><h2 className="mt-2 text-xl font-semibold">{contract?.offer.name ?? project.offer_name}</h2>{contract?.offer.short_description ? <p className="mt-2 text-sm text-white/60">{contract.offer.short_description}</p> : null}</div><CardContent className="space-y-5 p-6"><div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/60 p-4"><div><p className="text-xs text-muted-foreground">Disponíveis</p><p className="mt-1 text-2xl font-semibold text-primary">{project.change_requests_remaining}</p></div><div><p className="text-xs text-muted-foreground">Limite mensal</p><p className="mt-1 text-2xl font-semibold">{project.monthly_change_request_limit}</p></div></div>{contract ? <div className="space-y-3"><SummaryRow label="Status" value={contractStatusLabels[contract.status] ?? contract.status} /><SummaryRow label="Valor" value={amount ? formatMoney(amount) : "—"} />{subscription ? <SummaryRow label="Ciclo" value={cycleLabel[subscription.cycle] ?? subscription.cycle} /> : null}{dueDate ? <SummaryRow label={isSubscription ? "Próxima cobrança" : "Vencimento"} value={new Date(`${dueDate}T12:00:00`).toLocaleDateString("pt-BR")} icon={<CalendarDays className="h-3.5 w-3.5" />} /> : null}</div> : <p className="text-sm text-muted-foreground">Carregando informações da contratação…</p>}{contract?.offer.features?.length ? <div className="border-t pt-5"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Incluído na oferta</p><ul className="mt-3 space-y-2 text-sm">{contract.offer.features.slice(0, 5).map((feature) => <li key={feature} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{feature}</li>)}</ul></div> : null}</CardContent></Card>
}

function SummaryRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4 text-sm"><span className="text-muted-foreground">{label}</span><span className="flex items-center gap-1.5 text-right font-medium">{icon}{value}</span></div>
}
