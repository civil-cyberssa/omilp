"use client"

import { useState } from "react"
import useSWR from "swr"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { BarChart3, Eye, MousePointerClick, Send, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AnalyticsSummary, dashboardFetcher } from "@/lib/dashboard-api"

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
  ] : []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-[#155EEF]">Aquisição</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Analytics</h1><p className="mt-2 text-muted-foreground">Acessos, origem das campanhas e conversões da página principal.</p></div>
        <Select value={days} onValueChange={setDays}><SelectTrigger aria-label="Período das métricas" className="w-44 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Hoje</SelectItem><SelectItem value="7">Últimos 7 dias</SelectItem><SelectItem value="30">Últimos 30 dias</SelectItem><SelectItem value="90">Últimos 90 dias</SelectItem></SelectContent></Select>
      </div>

      {error ? <Card><CardContent className="py-14 text-center text-sm text-destructive">Não foi possível carregar as métricas.</CardContent></Card> : null}
      {isLoading ? <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[1, 2, 3, 4, 5].map((item) => <Skeleton key={item} className="h-32" />)}</div><div className="grid gap-6 xl:grid-cols-2"><Skeleton className="h-[390px]" /><Skeleton className="h-[390px]" /></div></> : null}
      {data ? <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden border-[#4338FF]/10"><CardHeader><CardTitle>Origens</CardTitle></CardHeader><CardContent className="p-0">{data.sources.length ? <Table><TableHeader><TableRow><TableHead>UTM source</TableHead><TableHead className="text-right">Acessos</TableHead><TableHead className="text-right">Visitantes</TableHead></TableRow></TableHeader><TableBody>{data.sources.map((source) => <TableRow key={source.label}><TableCell className="font-medium">{source.label || "Direto"}</TableCell><TableCell className="text-right">{formatNumber(source.views)}</TableCell><TableCell className="text-right">{formatNumber(source.visitors)}</TableCell></TableRow>)}</TableBody></Table> : <p className="px-6 py-12 text-center text-sm text-muted-foreground">Nenhuma origem registrada.</p>}</CardContent></Card>
          <Card className="overflow-hidden border-[#4338FF]/10"><CardHeader><CardTitle>Campanhas</CardTitle></CardHeader><CardContent className="p-0">{data.campaigns.length ? <Table><TableHeader><TableRow><TableHead>UTM campaign</TableHead><TableHead className="text-right">Acessos</TableHead><TableHead className="text-right">Visitantes</TableHead></TableRow></TableHeader><TableBody>{data.campaigns.map((campaign) => <TableRow key={campaign.label}><TableCell className="font-medium">{campaign.label}</TableCell><TableCell className="text-right">{formatNumber(campaign.views)}</TableCell><TableCell className="text-right">{formatNumber(campaign.visitors)}</TableCell></TableRow>)}</TableBody></Table> : <p className="px-6 py-12 text-center text-sm text-muted-foreground">Nenhuma campanha UTM registrada.</p>}</CardContent></Card>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">Métricas próprias da Omi. Visitantes são identificadores anônimos; IP e user-agent bruto não são armazenados. Navegadores com “Do Not Track” ativo não enviam eventos.</p>
      </> : null}
    </div>
  )
}
