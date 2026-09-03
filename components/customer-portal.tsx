"use client"

import { ArrowRight, ClipboardList, CreditCard, Globe2, RefreshCw, UserRound } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import useSWR from "swr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatMoney } from "@/lib/commerce"
import { PortalData, PortalRequestError, portalFetcher } from "@/lib/portal"

const labels: Record<string, string> = { CREATED: "Criado", PENDING_PAYMENT: "Aguardando pagamento", PAID: "Pago", CANCELED: "Cancelado", ACTIVE: "Ativa", OVERDUE: "Inadimplente", PAUSED: "Pausada", COMPLETED: "Concluído", RECEIVED: "Recebido", REVIEWING: "Em análise", APPROVED: "Aprovado", IN_PROGRESS: "Em produção" }

export function CustomerPortal() {
  const { data, error, mutate } = useSWR<PortalData>("/api/portal/me", portalFetcher)
  const sessionInvalid = error instanceof PortalRequestError && [401, 403].includes(error.status)
  useEffect(() => { if (sessionInvalid) window.location.replace("/area-cliente/entrar") }, [sessionInvalid])
  if (error) return <PortalError retry={() => void mutate()} />
  if (!data) return <div className="mx-auto max-w-7xl space-y-4">{[1,2,3].map((item) => <Skeleton key={item} className="h-36" />)}</div>

  return <div className="mx-auto max-w-7xl space-y-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#155EEF]">Visão geral</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Olá, {data.customer.name.split(" ")[0]}.</h1><p className="mt-2 text-muted-foreground">Acompanhe tudo que está sendo construído para sua empresa.</p></div><Button asChild variant="outline"><Link href="/area-cliente/perfil"><UserRound />Meus dados</Link></Button></div><div className="grid gap-4 md:grid-cols-3"><Metric label="Pedidos" value={data.orders.length} icon={CreditCard} /><Metric label="Sites publicados" value={data.projects.length} icon={Globe2} /><Metric label="Briefings enviados" value={data.briefings.length} icon={ClipboardList} /></div><div className="grid gap-5 xl:grid-cols-3"><OverviewCard title="Pedidos" href="/area-cliente/planos">{data.orders.slice(0,3).map((order) => <OverviewRow key={order.id} title={order.offer.name} meta={formatMoney(order.total)} status={order.status} />)}</OverviewCard><OverviewCard title="Projetos" href="/area-cliente/sites">{data.projects.slice(0,3).map((project) => <OverviewRow key={project.id} title={project.offer_name} meta={`${project.change_requests_remaining} alterações disponíveis`} status="Publicado" />)}</OverviewCard><OverviewCard title="Briefings" href="/area-cliente/briefings">{data.briefings.slice(0,3).map((briefing) => <OverviewRow key={briefing.id} title={briefing.project_name} meta={`Enviado em ${new Date(briefing.created_at).toLocaleDateString("pt-BR")}`} status={briefing.status} />)}</OverviewCard></div></div>
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Globe2 }) { return <Card className="border-[#4338FF]/10 shadow-[0_12px_40px_rgba(67,56,255,.06)]"><CardContent className="flex items-center justify-between p-6"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-semibold">{value}</p></div><span className="rounded-full bg-[#4338FF]/10 p-3 text-[#4338FF]"><Icon /></span></CardContent></Card> }
function OverviewCard({ title, href, children }: { title: string; href: string; children: React.ReactNode }) { const empty = Array.isArray(children) && children.length === 0; return <Card><CardHeader className="flex-row items-center justify-between"><CardTitle>{title}</CardTitle><Button asChild variant="ghost" size="sm"><Link href={href}>Ver todos <ArrowRight /></Link></Button></CardHeader><CardContent>{empty ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhum registro.</p> : <div className="divide-y">{children}</div>}</CardContent></Card> }
function OverviewRow({ title, meta, status }: { title: string; meta: string; status: string }) { return <div className="flex items-center justify-between gap-3 py-4"><div className="min-w-0"><p className="truncate text-sm font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{meta}</p></div><Badge variant="secondary">{labels[status] ?? status}</Badge></div> }
function PortalError({ retry }: { retry: () => void }) { return <div className="mx-auto max-w-xl rounded-xl border bg-card p-12 text-center"><p className="text-lg font-semibold">Não foi possível abrir sua área.</p><Button className="mt-5" onClick={retry}><RefreshCw />Tentar novamente</Button></div> }
