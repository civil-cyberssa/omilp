"use client"

import { Activity, ExternalLink, FileText, Globe2, Loader2, Plus, Send, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardAsaasLogEntry, DashboardBriefing, DashboardOrder, DashboardProject, DashboardSubscription, PagedResponse, dashboardFetcher, dashboardMutation, formatDashboardDateTime } from "@/lib/dashboard-api"
import { cycleLabel, formatMoney } from "@/lib/commerce"

export function BillingDetail({ type, id }: { type: "orders" | "subscriptions"; id: string }) {
  const router = useRouter()
  const { data, error, mutate } = useSWR<DashboardOrder | DashboardSubscription>(`/api/backoffice/${type}/${id}`, dashboardFetcher)
  const projectSource = type === "orders" ? "order" : "subscription"
  const { data: relatedProjects, error: projectsError } = useSWR<PagedResponse<DashboardProject>>(`/api/backoffice/projects?${projectSource}=${id}&page_size=10`, dashboardFetcher)
  const [canceling, setCanceling] = useState(false)
  const [cancelError, setCancelError] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [limitSaving, setLimitSaving] = useState(false)
  const [limitError, setLimitError] = useState("")
  if (error) return <p className="text-destructive">Registro não encontrado.</p>
  if (!data) return <Skeleton className="mx-auto h-96 max-w-4xl" />
  const isOrder = "total" in data
  const canCancel = isOrder ? ["CREATED", "PENDING_PAYMENT", "ERROR"].includes(data.status) : !["CANCELED", "COMPLETED"].includes(data.status)
  const canDelete = isOrder || ["CANCELED", "COMPLETED"].includes(data.status)

  async function cancel() {
    const message = isOrder
      ? "Confirmar o cancelamento desta cobrança no Asaas?"
      : "Cancelar esta assinatura? As cobranças futuras serão interrompidas e os pagamentos já concluídos serão preservados."
    if (!confirm(message)) return
    setCanceling(true); setCancelError("")
    try { await dashboardMutation(`/api/backoffice/${type}/${id}/cancel`, { method: "POST" }); await mutate() }
    catch (cause) { setCancelError(cause instanceof Error ? cause.message : "Não foi possível cancelar") }
    finally { setCanceling(false) }
  }

  async function remove() {
    const resourceLabel = isOrder ? "pedido" : "assinatura"
    if (!confirm(`Excluir este ${resourceLabel}? Esta ação não pode ser desfeita.`)) return
    setDeleting(true); setCancelError("")
    try {
      await dashboardMutation(`/api/backoffice/${type}/${id}`, { method: "DELETE" })
      toast.success(isOrder ? "Pedido excluído com sucesso." : "Assinatura excluída com sucesso.")
      router.replace(`/dashboard/${isOrder ? "pedidos" : "assinaturas"}`)
      router.refresh()
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : `Não foi possível excluir ${resourceLabel}.`
      setCancelError(message)
      toast.error(isOrder ? "O pedido não foi excluído." : "A assinatura não foi excluída.", { description: message })
    } finally {
      setDeleting(false)
    }
  }

  async function saveLimit(formData: FormData) {
    setLimitSaving(true); setLimitError("")
    try {
      await dashboardMutation(`/api/backoffice/${type}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthly_change_request_limit: Number(formData.get("monthly_change_request_limit")) }),
      })
      await mutate()
    } catch (cause) {
      setLimitError(cause instanceof Error ? cause.message : "Não foi possível salvar o limite")
    } finally {
      setLimitSaving(false)
    }
  }

  async function sharePaymentLink(paymentLink: string, offerName: string) {
    try {
      if (navigator.share) {
        await navigator.share({ title: `Oferta ${offerName}`, text: "Confira sua oferta e prossiga com o pagamento:", url: paymentLink })
      } else {
        await navigator.clipboard.writeText(paymentLink)
        toast.success("Link da oferta copiado.")
      }
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return
      toast.error("Não foi possível compartilhar o link.")
    }
  }

  return <div className="mx-auto max-w-5xl space-y-7">
    <div><p className="text-sm font-medium text-[#155EEF]">Financeiro</p><h1 className="mt-1 text-3xl font-semibold">{isOrder ? "Pedido" : "Assinatura"}</h1><p className="mt-2 font-mono text-xs text-muted-foreground">{data.id}</p></div>
    <div className="grid gap-5 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Contratação</CardTitle></CardHeader><CardContent className="space-y-4"><Row label="Oferta" value={data.offer.name} />{isOrder && data.base_price && Number(data.discount_value) > 0 ? <><Row label="Preço original" value={formatMoney(data.base_price)} /><Row label="Desconto" value={data.discount_type === "FIXED" ? formatMoney(data.discount_value) : `${Number(data.discount_value).toLocaleString("pt-BR")}%`} /></> : null}<Row label="Valor" value={formatMoney(isOrder ? data.total : data.value)} />{!isOrder ? <Row label="Ciclo" value={cycleLabel[data.cycle] ?? data.cycle} /> : null}<Row label="Criado em" value={formatDashboardDateTime(data.created_at)} />{data.payment_link ? <Button type="button" className="w-full" onClick={() => sharePaymentLink(data.payment_link, data.offer.name)}><Send className="h-4 w-4" />Enviar link da oferta</Button> : null}{data.checkout_url ? <a href={data.checkout_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#4338FF]">Abrir checkout <ExternalLink className="h-4 w-4" /></a> : null}</CardContent></Card>
      <Card><CardHeader><CardTitle>Cliente</CardTitle></CardHeader><CardContent className="space-y-4">{data.customer ? <><Row label="Nome" value={data.customer.name} /><Row label="E-mail" value={data.customer.email} /><Row label="Telefone" value={data.customer.phone || "—"} /><Row label="Empresa" value={data.customer.company || "—"} /></> : <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Os dados serão preenchidos pelo cliente através do link da oferta.</p>}</CardContent></Card>
      {isOrder ? <BriefingCard briefing={data.briefing} /> : null}
      <Card className="lg:col-span-2"><CardHeader><CardTitle>Status financeiro</CardTitle></CardHeader><CardContent><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><Badge>{data.status}</Badge><p className="mt-3 text-xs text-muted-foreground">Confirmações são atualizadas pelos webhooks do Asaas; recusas do checkout também ficam registradas.</p></div><div className="flex flex-wrap gap-2">{canCancel ? <Button variant="destructive" disabled={canceling || deleting} onClick={cancel}>{canceling ? <><Loader2 className="animate-spin" />Cancelando</> : isOrder ? "Cancelar no Asaas" : "Cancelar assinatura"}</Button> : null}{canDelete ? <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive" disabled={canceling || deleting} onClick={remove}>{deleting ? <><Loader2 className="animate-spin" />Excluindo</> : <><Trash2 />Excluir {isOrder ? "pedido" : "assinatura"}</>}</Button> : null}</div></div>{cancelError ? <p className="mt-4 text-sm text-destructive">{cancelError}</p> : null}{isOrder ? <AsaasLog entries={data.asaas_log} /> : null}</CardContent></Card>
      <Card className="lg:col-span-2"><CardHeader><CardTitle>Solicitações de alteração</CardTitle></CardHeader><CardContent><form action={saveLimit} className="flex flex-col gap-3 sm:flex-row sm:items-end"><div className="flex-1 space-y-2"><label htmlFor="monthly_change_request_limit" className="text-sm font-medium">Limite mensal específico</label><input id="monthly_change_request_limit" name="monthly_change_request_limit" type="number" min="0" defaultValue={data.monthly_change_request_limit} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div><Button disabled={limitSaving}>{limitSaving ? <><Loader2 className="animate-spin" />Salvando</> : "Salvar limite"}</Button></form>{limitError ? <p className="mt-3 text-sm text-destructive">{limitError}</p> : null}<p className="mt-3 text-xs text-muted-foreground">Este valor substitui o limite copiado da oferta para esta contratação.</p></CardContent></Card>
      <Card className="lg:col-span-2">
        <CardHeader className="flex-row items-center justify-between gap-4"><div><CardTitle>Projeto relacionado</CardTitle><p className="mt-1 text-sm text-muted-foreground">Site publicado vinculado a esta contratação.</p></div>{relatedProjects?.results.length === 0 ? <Button asChild><Link href={`/dashboard/projetos/novo?type=${projectSource}&id=${id}`}><Plus />Adicionar projeto</Link></Button> : null}</CardHeader>
        <CardContent>{!relatedProjects && !projectsError ? <Skeleton className="h-24" /> : projectsError ? <p className="text-sm text-destructive">Não foi possível carregar o projeto relacionado.</p> : relatedProjects!.results.length === 0 ? <div className="rounded-lg border border-dashed p-8 text-center"><Globe2 className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 text-sm font-medium">Nenhum projeto vinculado</p><p className="mt-1 text-sm text-muted-foreground">Cadastre o endereço do site entregue para este cliente.</p><Button asChild variant="outline" className="mt-5 sm:hidden"><Link href={`/dashboard/projetos/novo?type=${projectSource}&id=${id}`}><Plus />Adicionar projeto</Link></Button></div> : <div className="divide-y">{relatedProjects!.results.map((project) => <div key={project.id} className="flex flex-col justify-between gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"><div className="flex min-w-0 items-center gap-3"><span className="rounded-full bg-primary/10 p-2.5 text-primary"><Globe2 className="h-5 w-5" /></span><div className="min-w-0"><p className="font-medium">{project.offer_name}</p><a href={project.site} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 truncate text-sm text-muted-foreground hover:text-primary">{project.site}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a></div></div><Button asChild variant="outline"><Link href={`/dashboard/projetos/${project.id}`}>Gerenciar projeto</Link></Button></div>)}</div>}</CardContent>
      </Card>
    </div>
  </div>
}

function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 border-b pb-3 last:border-0"><span className="text-sm text-muted-foreground">{label}</span><span className="text-right text-sm font-medium">{value}</span></div> }

const asaasEventLabels: Record<string, string> = {
  PAYMENT_CREATED: "Pagamento criado",
  PAYMENT_RECEIVED: "Pagamento recebido",
  PAYMENT_CONFIRMED: "Pagamento confirmado",
  PAYMENT_UPDATED: "Pagamento atualizado",
  PAYMENT_OVERDUE: "Pagamento vencido",
  PAYMENT_REFUNDED: "Pagamento estornado",
  PAYMENT_PARTIALLY_REFUNDED: "Estorno parcial",
  PAYMENT_DELETED: "Pagamento removido",
  PAYMENT_REJECTED: "Pagamento recusado",
}

function AsaasLog({ entries }: { entries: DashboardAsaasLogEntry[] }) {
  return <div className="mt-6 border-t pt-6">
    <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-[#155EEF]" /><h3 className="text-sm font-semibold">Log do Asaas</h3></div>
    {entries.length === 0
      ? <p className="mt-3 rounded-lg border border-dashed p-5 text-sm text-muted-foreground">Nenhum retorno do Asaas foi registrado para este pedido.</p>
      : <div className="mt-4 space-y-3">{entries.map((entry, index) => <div key={`${entry.payment_id}-${entry.event_id}-${entry.received_at}-${index}`} className="rounded-lg border bg-muted/20 p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">{asaasEventLabels[entry.event_type] ?? entry.event_type}</p>
              <Badge variant="outline">{entry.status}</Badge>
              {entry.error_code ? <Badge variant="destructive">{entry.error_code}</Badge> : null}
              {!entry.processed ? <Badge variant="destructive">Falha no processamento</Badge> : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Recebido em {formatDashboardDateTime(entry.received_at)}</p>
          </div>
          <p className="text-sm font-semibold">{formatMoney(entry.value)}</p>
        </div>
        {entry.error ? <p className="mt-3 rounded-md bg-destructive/10 p-3 text-xs text-destructive">{entry.error}</p> : null}
        {entry.payment_id || entry.event_id ? <dl className="mt-4 grid gap-3 border-t pt-3 text-xs sm:grid-cols-2">
          <div><dt className="text-muted-foreground">ID do pagamento</dt><dd className="mt-1 break-all font-mono">{entry.payment_id || "—"}</dd></div>
          <div><dt className="text-muted-foreground">ID do evento</dt><dd className="mt-1 break-all font-mono">{entry.event_id || "—"}</dd></div>
        </dl> : null}
      </div>)}</div>}
  </div>
}

function BriefingCard({ briefing }: { briefing: DashboardBriefing | null }) {
  if (!briefing) {
    return <Card className="lg:col-span-2"><CardHeader><CardTitle>Briefing</CardTitle></CardHeader><CardContent><div className="rounded-lg border border-dashed p-8 text-center"><FileText className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 text-sm font-medium">Briefing ainda não enviado</p><p className="mt-1 text-sm text-muted-foreground">As informações do projeto aparecerão aqui após o preenchimento pelo cliente.</p></div></CardContent></Card>
  }

  const domain = briefing.extra_data.domain
  const colors = briefing.extra_data.brand_colors
  const domainText = domain?.has_domain ? domain.current : domain?.desired_options?.join(", ")
  const colorsText = colors?.unsure
    ? colors.name
    : (colors?.hexes?.length ? colors.hexes : [colors?.hex]).filter(Boolean).join(", ")

  return <Card className="lg:col-span-2 overflow-hidden">
    <CardHeader className="flex-row items-start justify-between gap-4 border-b bg-muted/25">
      <div><CardTitle>Briefing</CardTitle><p className="mt-1 text-sm text-muted-foreground">Enviado em {formatDashboardDateTime(briefing.created_at)}</p></div>
      <Badge variant="outline">{briefing.status}</Badge>
    </CardHeader>
    <CardContent className="grid gap-px bg-border p-0 sm:grid-cols-2">
      <BriefingItem label="Nome do projeto" value={briefing.project_name} />
      <BriefingItem label="Páginas desejadas" value={briefing.desired_pages.join(", ")} />
      <BriefingItem label="Sobre o negócio" value={briefing.business_description} wide />
      <BriefingItem label="Objetivos" value={briefing.goals} wide />
      <BriefingItem label="Público-alvo" value={briefing.target_audience} />
      <BriefingItem label="Referências visuais" value={briefing.visual_references} />
      <BriefingItem label="Domínio" value={domainText} />
      <BriefingItem label="Cores da marca" value={colorsText} />
      <BriefingItem label="Cor a evitar" value={briefing.extra_data.color_to_avoid} />
      <BriefingItem label="Materiais da marca" value={briefing.brand_assets_url} link />
    </CardContent>
  </Card>
}

function BriefingItem({ label, value, wide = false, link = false }: { label: string; value?: string; wide?: boolean; link?: boolean }) {
  return <div className={`bg-card p-5 ${wide ? "sm:col-span-2" : ""}`}><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>{link && value ? <a href={value} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 break-all text-sm font-medium text-primary hover:underline">{value}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a> : <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{value || "Não informado"}</p>}</div>
}
