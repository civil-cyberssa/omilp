"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import useSWR from "swr"
import { ClipboardList, CreditCard, FileText, LogOut, RefreshCw } from "lucide-react"
import { BriefingActions } from "@/components/briefing-actions"
import { CustomerDataDialog } from "@/components/customer-data-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cycleLabel, formatMoney } from "@/lib/commerce"
import { PortalData, PortalRequestError, portalFetcher } from "@/lib/portal"

const labels: Record<string, string> = { CREATED: "Criado", PENDING_PAYMENT: "Aguardando pagamento", PAID: "Pago", CANCELED: "Cancelado", REFUNDED: "Estornado", ERROR: "Erro", PENDING: "Pendente", ACTIVE: "Ativa", OVERDUE: "Inadimplente", PAUSED: "Pausada", COMPLETED: "Concluída", RECEIVED: "Recebido", REVIEWING: "Em análise", APPROVED: "Aprovado", IN_PROGRESS: "Em produção" }
export function CustomerPortal() {
  const router = useRouter(); const { data, error, mutate } = useSWR<PortalData>("/api/portal/me", portalFetcher)
  const sessionInvalid = error instanceof PortalRequestError && (error.status === 401 || error.status === 403)

  useEffect(() => {
    if (!sessionInvalid) return
    void fetch("/api/portal/logout", { method: "POST", keepalive: true }).catch(() => undefined)
    window.location.replace("/area-cliente/entrar")
  }, [sessionInvalid])

  async function logout() { await fetch("/api/portal/logout", { method: "POST" }); router.replace("/area-cliente/entrar"); router.refresh() }
  if (sessionInvalid) return <div className="mx-auto max-w-xl px-6 py-36 text-center"><RefreshCw className="mx-auto animate-spin text-[#8EA8FF]" /><p className="mt-4 text-white/60">Sua sessão expirou. Redirecionando para o acesso…</p><a href="/area-cliente/entrar" className="mt-5 inline-block text-sm font-semibold text-[#AFA8FF] underline underline-offset-4">Entrar novamente</a></div>
  if (error) return <div className="mx-auto max-w-xl px-6 py-36 text-center"><p className="text-xl font-semibold">Não foi possível abrir sua área.</p><p className="mt-3 text-sm text-white/55">{error instanceof Error ? error.message : "Tente novamente em alguns instantes."}</p><Button className="mt-5" onClick={() => void mutate()}><RefreshCw />Tentar novamente</Button></div>
  if (!data) return <div className="mx-auto max-w-6xl space-y-4 px-6 py-36">{[1,2,3].map(i => <Skeleton key={i} className="h-28 bg-white/10" />)}</div>
  return <section className="container mx-auto max-w-6xl px-6 pb-24 pt-32">
    <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.25em] text-[#8EA8FF]">Área do cliente</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.04em]">Olá, {data.customer.name.split(" ")[0]}.</h1><p className="mt-2 text-white/48">Acompanhe sua contratação e as informações do projeto.</p></div><div className="flex flex-wrap gap-2"><CustomerDataDialog customer={data.customer} onSaved={(customer) => void mutate({ ...data, customer }, { revalidate: false })} /><Button variant="outline" onClick={logout} className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"><LogOut />Sair</Button></div></div>
    <div className="mt-8 grid gap-5 lg:grid-cols-2">
      <PortalCard title="Pedidos" icon={CreditCard} empty="Nenhum pedido encontrado.">{data.orders.map(item => <ResourceRow key={item.id} title={item.offer.name} status={item.status} meta={`${formatMoney(item.total)} · vencimento ${new Date(item.due_date + "T12:00:00").toLocaleDateString("pt-BR")}`} href={`/area-cliente/briefing?tipo=order&id=${item.id}`} checkout={item.status === "PENDING_PAYMENT" ? item.checkout_url : ""} />)}</PortalCard>
      <PortalCard title="Assinaturas" icon={RefreshCw} empty="Nenhuma assinatura encontrada.">{data.subscriptions.map(item => <ResourceRow key={item.id} title={item.offer.name} status={item.status} meta={`${formatMoney(item.value)} / ${cycleLabel[item.cycle] ?? "período"}`} href={`/area-cliente/briefing?tipo=subscription&id=${item.id}`} checkout={item.status === "PENDING" ? item.checkout_url : ""} />)}</PortalCard>
      <div className="lg:col-span-2"><PortalCard title="Briefings" icon={ClipboardList} empty="Nenhum briefing enviado.">{data.briefings.map(item => <div key={item.id} className="flex items-center justify-between gap-4 border-t border-white/8 py-4 first:border-0"><div className="min-w-0"><p className="truncate font-medium">{item.project_name}</p><p className="mt-1 text-xs text-white/42">Enviado em {new Date(item.created_at).toLocaleDateString("pt-BR")}{item.edited_at ? <> · editado em {new Date(item.edited_at).toLocaleDateString("pt-BR")}</> : null}</p></div><div className="flex shrink-0 items-center gap-2"><Badge>{labels[item.status] ?? item.status}</Badge><BriefingActions briefing={item} onSaved={() => void mutate()} /></div></div>)}</PortalCard></div>
    </div>
  </section>
}
function PortalCard({ title, icon: Icon, empty, children }: { title: string; icon: typeof FileText; empty: string; children: React.ReactNode }) { const hasItems = Array.isArray(children) ? children.length > 0 : Boolean(children); return <Card className="border-white/12 bg-white/[.025] text-white"><CardHeader className="flex-row items-center gap-3"><span className="rounded-full bg-[#4338FF]/20 p-2 text-[#AFA8FF]"><Icon /></span><CardTitle className="text-xl">{title}</CardTitle></CardHeader><CardContent>{hasItems ? children : <p className="py-6 text-sm text-white/42">{empty}</p>}</CardContent></Card> }
function ResourceRow({ title, status, meta, href, checkout }: { title: string; status: string; meta: string; href: string; checkout: string }) { return <div className="border-t border-white/8 py-4 first:border-0"><div className="flex items-start justify-between gap-4"><div><p className="font-medium">{title}</p><p className="mt-1 text-xs text-white/42">{meta}</p></div><Badge>{labels[status] ?? status}</Badge></div><div className="mt-4 flex gap-3">{checkout ? <a href={checkout} className="text-xs font-semibold text-[#8EA8FF]" target="_blank" rel="noreferrer">Continuar pagamento</a> : null}<Link href={href} className="text-xs font-semibold text-[#D6D3FF]">Enviar briefing</Link></div></div> }
