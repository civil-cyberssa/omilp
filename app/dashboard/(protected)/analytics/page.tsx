"use client"

import { useState } from "react"
import useSWR from "swr"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { AlertTriangle, BarChart3, Eye, LayoutPanelTop, MousePointerClick, Route, Send, Tags, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AnalyticsSummary, dashboardFetcher, formatDashboardDateTime } from "@/lib/dashboard-api"

const numberFormatter = new Intl.NumberFormat("pt-BR")
const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" })
const longDateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" })
const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
const hours = Array.from({ length: 24 }, (_, hour) => hour)
const chartConfig = {
  views: { label: "Acessos", color: "#4338FF" },
  conversions: { label: "Conversões", color: "#D000B8" },
} satisfies ChartConfig

function formatNumber(value: number) {
  return numberFormatter.format(value)
}

function dateFromApi(value: string) {
  return new Date(`${value}T12:00:00`)
}

function periodLabel(periodDays: number) {
  return periodDays === 1 ? "hoje" : `nos últimos ${periodDays} dias`
}

function heatClass(value: number, maximum: number) {
  if (!value) return "border-border/70 bg-muted/60"
  const ratio = value / maximum
  if (ratio <= 0.25) return "border-[#D9DDFF] bg-[#E9EBFF]"
  if (ratio <= 0.5) return "border-[#AEB6FF] bg-[#BDC4FF]"
  if (ratio <= 0.75) return "border-[#737FFF] bg-[#818CFF]"
  return "border-[#3442D9] bg-[#4338FF]"
}

const checkoutErrorLabels: Record<string, string> = {
  form_validation: "Validação do formulário",
  http_error: "Resposta HTTP",
  invalid_response: "Resposta inválida",
  network_error: "Falha de conexão",
  postal_code_lookup: "Consulta de CEP",
  runtime_error: "Erro de JavaScript",
  unknown: "Não classificado",
}

function formatCapturedJson(value: unknown) {
  if (value === null || value === undefined) return "Não disponível"
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return "Não foi possível exibir o conteúdo capturado"
  }
}

function CheckoutErrors({ data }: { data: AnalyticsSummary }) {
  const errors = data.checkout_errors ?? []
  const types = data.checkout_error_types ?? []
  return <Card className="overflow-hidden border-rose-200 shadow-[0_16px_50px_rgba(225,29,72,.06)]">
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-600" />Erros na contratação</CardTitle>
      <CardDescription>Ocorrências na jornada de checkout, com dados técnicos e valores sanitizados. Nome, e-mail e telefone ficam visíveis; documentos, endereço e informações financeiras permanecem protegidos.</CardDescription>
      {types.length ? <div className="flex flex-wrap gap-2 pt-3">{types.map((item) => <span key={item.error_type || "unknown"} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-800">{checkoutErrorLabels[item.error_type] ?? item.error_type ?? "Não classificado"} · {formatNumber(item.count)}</span>)}</div> : null}
    </CardHeader>
    <CardContent className="p-0">
      {errors.length ? <div className="divide-y">{errors.map((error) => <details key={error.id} className="group px-5 py-4 open:bg-muted/30">
        <summary className="grid cursor-pointer list-none gap-3 marker:hidden sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-center">
          <span className="text-xs text-muted-foreground">{formatDashboardDateTime(error.created_at)}</span>
          <span className="min-w-0"><span className="block truncate text-sm font-semibold">{checkoutErrorLabels[error.error_type] ?? error.error_type}</span><span className="block truncate font-mono text-[10px] text-muted-foreground">{error.error_code || "SEM_CÓDIGO"} · {error.endpoint || error.path}</span></span>
          <span className="flex items-center gap-2 text-xs"><span className="rounded-full border bg-background px-2.5 py-1 font-mono">{error.status_code ? `HTTP ${error.status_code}` : "Sem status"}</span><span className="text-muted-foreground transition group-open:rotate-180">⌄</span></span>
        </summary>
        <div className="mt-5 space-y-5 border-t pt-5">
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="text-xs text-muted-foreground">Oferta</p><p className="mt-1 font-medium">{error.offer || "Não identificada"}</p></div>
            <div><p className="text-xs text-muted-foreground">Pagamento</p><p className="mt-1 font-medium">{error.billing_type || "Não selecionado"}</p></div>
            <div><p className="text-xs text-muted-foreground">Etapa</p><p className="mt-1 font-medium">{error.checkout_step ?? "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Requisição</p><p className="mt-1 break-all font-mono text-xs">{error.method || "—"} {error.endpoint || "—"}</p></div>
          </div>
          <div className="rounded-lg border border-rose-100 bg-rose-50/60 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Mensagem</p><p className="mt-2 text-sm text-rose-950">{error.message || "Erro sem mensagem"}</p>{error.validation_fields?.length ? <p className="mt-2 font-mono text-xs text-rose-700">Campos: {error.validation_fields.join(", ")}</p> : null}</div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">JSON da requisição</p><pre className="max-h-80 overflow-auto rounded-lg bg-[#0B1020] p-4 text-[11px] leading-5 text-slate-200">{formatCapturedJson(error.request_payload)}</pre></div>
            <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Inputs preenchidos</p><pre className="max-h-80 overflow-auto rounded-lg bg-[#0B1020] p-4 text-[11px] leading-5 text-slate-200">{formatCapturedJson(error.inputs)}</pre></div>
          </div>
          {error.response_payload !== null && error.response_payload !== undefined ? <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resposta recebida</p><pre className="max-h-80 overflow-auto rounded-lg bg-[#0B1020] p-4 text-[11px] leading-5 text-slate-200">{formatCapturedJson(error.response_payload)}</pre></div> : null}
        </div>
      </details>)}</div> : <p className="px-6 py-12 text-center text-sm text-muted-foreground">Nenhum erro de contratação registrado neste período.</p>}
    </CardContent>
  </Card>
}

function AccessHeatmap({ rows, periodDays }: { rows: AnalyticsSummary["hourly"]; periodDays: number }) {
  const values = new Map(rows.map((item) => [`${item.weekday}:${item.hour}`, item.views]))
  const maximum = Math.max(...rows.map((item) => item.views), 1)

  return <Card className="overflow-hidden border-[#4338FF]/10">
    <CardHeader>
      <CardTitle>Acessos por dia e hora</CardTitle>
      <CardDescription>Visualizações por dia da semana e hora local {periodLabel(periodDays)}.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[720px]" role="group" aria-label="Mapa de calor de acessos por dia e hora">
          <div className="grid items-center gap-1.5" style={{ gridTemplateColumns: "2.75rem repeat(24, minmax(1rem, 1fr))" }}>
            <span />
            {hours.map((hour) => <span key={hour} className="text-center font-mono text-[9px] tabular-nums text-muted-foreground">{hour % 3 === 0 ? `${hour}h` : ""}</span>)}
            {weekdays.map((weekday, weekdayIndex) => <div key={weekday} className="contents">
              <span className="pr-2 text-right text-[10px] font-medium text-muted-foreground">{weekday}</span>
              {hours.map((hour) => {
                const views = values.get(`${weekdayIndex}:${hour}`) ?? 0
                return <span
                  key={`${weekdayIndex}:${hour}`}
                  role="img"
                  aria-label={`${weekday}, ${hour}h: ${formatNumber(views)} acesso${views === 1 ? "" : "s"}`}
                  title={`${weekday}, ${hour}h · ${formatNumber(views)} acesso${views === 1 ? "" : "s"}`}
                  className={`aspect-square rounded-[3px] border transition-transform hover:scale-125 hover:ring-2 hover:ring-ring/30 ${heatClass(views, maximum)}`}
                />
              })}
            </div>)}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground"><span>Menos</span>{[0, 1, 2, 3, 4].map((level) => <span key={level} className={`h-3 w-3 rounded-[3px] border ${heatClass(level, 4)}`} />)}<span>Mais</span></div>
    </CardContent>
  </Card>
}

export default function AnalyticsPage() {
  const [days, setDays] = useState("30")
  const { data, error, isLoading } = useSWR<AnalyticsSummary>(
    `/api/backoffice/analytics/summary?days=${days}`,
    dashboardFetcher,
  )
  const metrics = data ? [
    { label: "Visualizações", value: formatNumber(data.totals.views), icon: Eye },
    { label: "Visitantes únicos", value: formatNumber(data.totals.visitors), icon: Users },
    { label: "Conversões", value: formatNumber(data.totals.conversions), icon: Send },
    { label: "Taxa de conversão", value: `${data.totals.conversion_rate.toLocaleString("pt-BR")}%`, icon: BarChart3 },
    { label: "Cliques no WhatsApp", value: formatNumber(data.totals.whatsapp_clicks), icon: MousePointerClick },
    { label: "Visualizações de ofertas", value: formatNumber(data.totals.offer_views ?? 0), icon: Tags },
    { label: "Visitantes que viram ofertas", value: formatNumber(data.totals.offer_viewers ?? 0), icon: Users },
    { label: "Alcance das ofertas", value: `${(data.totals.offer_view_rate ?? 0).toLocaleString("pt-BR")}%`, icon: LayoutPanelTop },
    { label: "Erros na contratação", value: formatNumber(data.totals.checkout_errors ?? 0), icon: AlertTriangle },
  ] : []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-[#155EEF]">Aquisição</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Analytics</h1><p className="mt-2 text-muted-foreground">Jornada por páginas e seções, exposição às ofertas e conversões.</p></div>
        <Select value={days} onValueChange={setDays}><SelectTrigger aria-label="Período das métricas" className="w-44 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Hoje</SelectItem><SelectItem value="7">Últimos 7 dias</SelectItem><SelectItem value="30">Últimos 30 dias</SelectItem><SelectItem value="90">Últimos 90 dias</SelectItem></SelectContent></Select>
      </div>

      {error ? <Card><CardContent className="py-14 text-center text-sm text-destructive">Não foi possível carregar as métricas.</CardContent></Card> : null}
      {isLoading ? <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, item) => <Skeleton key={item} className="h-32" />)}</div><div className="grid gap-6 xl:grid-cols-2"><Skeleton className="h-[390px]" /><Skeleton className="h-[390px]" /></div></> : null}
      {data ? <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon }) => <Card key={label} className="border-[#4338FF]/10 shadow-[0_12px_40px_rgba(67,56,255,.06)]"><CardContent className="p-5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4338FF]/10 text-[#4338FF]"><Icon className="h-4 w-4" /></span><p className="mt-5 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></CardContent></Card>)}
        </div>

        <div className="grid items-stretch gap-6 xl:grid-cols-2">
          <Card className="overflow-hidden border-[#4338FF]/10">
            <CardHeader><CardTitle>Acessos e conversões por dia</CardTitle><CardDescription>Totais diários {periodLabel(data.period_days)}, incluindo dias sem atividade.</CardDescription></CardHeader>
            <CardContent>
              {data.totals.views || data.totals.conversions ? <ChartContainer config={chartConfig} className="h-[285px] w-full">
                <BarChart accessibilityLayer data={data.daily} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} interval={data.period_days === 7 ? 0 : data.period_days === 30 ? 4 : 14} tickFormatter={(value) => shortDateFormatter.format(dateFromApi(value))} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(_, payload) => { const date = payload[0]?.payload?.date; return typeof date === "string" ? longDateFormatter.format(dateFromApi(date)) : "" }} />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="views" fill="var(--color-views)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="conversions" fill="var(--color-conversions)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ChartContainer> : <p className="py-28 text-center text-sm text-muted-foreground">Ainda não há acessos ou conversões neste período.</p>}
            </CardContent>
          </Card>
          <AccessHeatmap rows={data.hourly} periodDays={data.period_days} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="overflow-hidden border-[#4338FF]/10">
            <CardHeader><CardTitle className="flex items-center gap-2"><Route className="h-4 w-4 text-[#4338FF]" />Páginas visitadas</CardTitle><CardDescription>Rotas com maior volume de visualizações no período.</CardDescription></CardHeader>
            <CardContent className="p-0">
              {(data.pages ?? []).length ? <Table><TableHeader><TableRow><TableHead>Página</TableHead><TableHead className="text-right">Views</TableHead><TableHead className="text-right">Visitantes</TableHead><TableHead className="text-right">Sessões</TableHead></TableRow></TableHeader><TableBody>{data.pages.map((page) => <TableRow key={page.path}><TableCell className="max-w-64 truncate font-mono text-xs" title={page.path}>{page.path}</TableCell><TableCell className="text-right font-medium">{formatNumber(page.views)}</TableCell><TableCell className="text-right">{formatNumber(page.visitors)}</TableCell><TableCell className="text-right">{formatNumber(page.sessions)}</TableCell></TableRow>)}</TableBody></Table> : <p className="px-6 py-12 text-center text-sm text-muted-foreground">Nenhuma página visualizada no período.</p>}
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-[#4338FF]/10">
            <CardHeader><CardTitle className="flex items-center gap-2"><LayoutPanelTop className="h-4 w-4 text-[#4338FF]" />Seções visualizadas</CardTitle><CardDescription>Blocos da página que chegaram à área visível do visitante.</CardDescription></CardHeader>
            <CardContent className="p-0">
              {(data.sections ?? []).length ? <div className="max-h-[28rem] overflow-auto"><Table><TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_hsl(var(--border))]"><TableRow><TableHead>Seção</TableHead><TableHead>Página</TableHead><TableHead className="text-right">Views</TableHead><TableHead className="text-right">Visitantes</TableHead></TableRow></TableHeader><TableBody>{data.sections.map((section) => <TableRow key={`${section.path}:${section.section_id}`}><TableCell><p className="max-w-56 truncate font-medium" title={section.section_name}>{section.section_name}</p><p className="font-mono text-[10px] text-muted-foreground">#{section.section_id}</p></TableCell><TableCell className="max-w-48 truncate font-mono text-xs" title={section.path}>{section.path}</TableCell><TableCell className="text-right font-medium">{formatNumber(section.views)}</TableCell><TableCell className="text-right">{formatNumber(section.visitors)}</TableCell></TableRow>)}</TableBody></Table></div> : <p className="px-6 py-12 text-center text-sm text-muted-foreground">Nenhuma seção visualizada no período.</p>}
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden border-[#D000B8]/15 shadow-[0_16px_50px_rgba(208,0,184,.06)]">
          <CardHeader><CardTitle className="flex items-center gap-2"><Tags className="h-4 w-4 text-[#D000B8]" />Visualização das ofertas</CardTitle><CardDescription>Cada registro confirma que o card da oferta entrou na área visível. Alcance considera sessões com ao menos uma oferta vista.</CardDescription></CardHeader>
          <CardContent className="p-0">
            {(data.offers ?? []).length ? <Table><TableHeader><TableRow><TableHead>Oferta</TableHead><TableHead>Página</TableHead><TableHead className="text-right">Visualizações</TableHead><TableHead className="text-right">Visitantes</TableHead><TableHead className="text-right">Sessões</TableHead></TableRow></TableHeader><TableBody>{data.offers.map((offer) => <TableRow key={`${offer.path}:${offer.offer}`}><TableCell><p className="font-medium">{offer.offer_name}</p><p className="font-mono text-[10px] text-muted-foreground">{offer.offer}</p></TableCell><TableCell className="max-w-64 truncate font-mono text-xs" title={offer.path}>{offer.path}</TableCell><TableCell className="text-right font-semibold text-[#D000B8]">{formatNumber(offer.views)}</TableCell><TableCell className="text-right">{formatNumber(offer.visitors)}</TableCell><TableCell className="text-right">{formatNumber(offer.sessions)}</TableCell></TableRow>)}</TableBody></Table> : <p className="px-6 py-12 text-center text-sm text-muted-foreground">Nenhuma oferta foi visualizada no período.</p>}
          </CardContent>
        </Card>

        <CheckoutErrors data={data} />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden border-[#4338FF]/10"><CardHeader><CardTitle>Origens</CardTitle></CardHeader><CardContent className="p-0">{data.sources.length ? <Table><TableHeader><TableRow><TableHead>UTM source</TableHead><TableHead className="text-right">Acessos</TableHead><TableHead className="text-right">Visitantes</TableHead></TableRow></TableHeader><TableBody>{data.sources.map((source) => <TableRow key={source.label}><TableCell className="font-medium">{source.label || "Direto"}</TableCell><TableCell className="text-right">{formatNumber(source.views)}</TableCell><TableCell className="text-right">{formatNumber(source.visitors)}</TableCell></TableRow>)}</TableBody></Table> : <p className="px-6 py-12 text-center text-sm text-muted-foreground">Nenhuma origem registrada.</p>}</CardContent></Card>
          <Card className="overflow-hidden border-[#4338FF]/10"><CardHeader><CardTitle>Campanhas</CardTitle></CardHeader><CardContent className="p-0">{data.campaigns.length ? <Table><TableHeader><TableRow><TableHead>UTM campaign</TableHead><TableHead className="text-right">Acessos</TableHead><TableHead className="text-right">Visitantes</TableHead></TableRow></TableHeader><TableBody>{data.campaigns.map((campaign) => <TableRow key={campaign.label}><TableCell className="font-medium">{campaign.label}</TableCell><TableCell className="text-right">{formatNumber(campaign.views)}</TableCell><TableCell className="text-right">{formatNumber(campaign.visitors)}</TableCell></TableRow>)}</TableBody></Table> : <p className="px-6 py-12 text-center text-sm text-muted-foreground">Nenhuma campanha UTM registrada.</p>}</CardContent></Card>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">Métricas próprias da Omi. Visitantes são identificadores anônimos; IP e user-agent bruto não são armazenados. Navegadores com “Do Not Track” ativo não enviam eventos.</p>
      </> : null}
    </div>
  )
}
