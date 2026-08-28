"use client"

import { useState } from "react"
import useSWR from "swr"
import { BarChart3, Eye, MousePointerClick, Send, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AnalyticsSummary, dashboardFetcher } from "@/lib/dashboard-api"

const numberFormatter = new Intl.NumberFormat("pt-BR")
const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" })

function formatNumber(value: number) {
  return numberFormatter.format(value)
}

export default function AnalyticsPage() {
  const [days, setDays] = useState("30")
  const { data, error, isLoading } = useSWR<AnalyticsSummary>(
    `/api/backoffice/analytics/summary?days=${days}`,
    dashboardFetcher,
  )
  const maxViews = Math.max(...(data?.daily.map((item) => item.views) ?? [1]), 1)
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
        <Select value={days} onValueChange={setDays}><SelectTrigger aria-label="Período das métricas" className="w-44 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7">Últimos 7 dias</SelectItem><SelectItem value="30">Últimos 30 dias</SelectItem><SelectItem value="90">Últimos 90 dias</SelectItem></SelectContent></Select>
      </div>

      {error ? <Card><CardContent className="py-14 text-center text-sm text-destructive">Não foi possível carregar as métricas.</CardContent></Card> : null}
      {isLoading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[1, 2, 3, 4, 5].map((item) => <Skeleton key={item} className="h-32" />)}</div> : null}
      {data ? <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map(({ label, value, icon: Icon }) => <Card key={label} className="border-[#4338FF]/10 shadow-[0_12px_40px_rgba(67,56,255,.06)]"><CardContent className="p-5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#155EEF]/10 to-[#D000B8]/15 text-[#4338FF]"><Icon className="h-4 w-4" /></span><p className="mt-5 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></CardContent></Card>)}
        </div>

        <Card className="overflow-hidden border-[#4338FF]/10">
          <CardHeader><CardTitle>Visualizações por dia</CardTitle></CardHeader>
          <CardContent>
            {data.daily.length ? <div className="flex h-64 items-end gap-1.5 overflow-x-auto border-b border-border/70 pb-8 pt-4 sm:gap-2">{data.daily.map((item) => <div key={item.date} className="group relative flex h-full min-w-5 flex-1 items-end" title={`${item.views} visualizações · ${item.conversions} conversões`}><div className="w-full rounded-t-sm bg-gradient-to-t from-[#155EEF] via-[#4338FF] to-[#D000B8] transition-opacity group-hover:opacity-80" style={{ height: `${Math.max((item.views / maxViews) * 100, item.views ? 4 : 1)}%` }} /><span className="absolute -bottom-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-[9px] text-muted-foreground sm:group-hover:block">{shortDateFormatter.format(new Date(`${item.date}T12:00:00`))}</span></div>)}</div> : <p className="py-20 text-center text-sm text-muted-foreground">Ainda não há acessos neste período.</p>}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden border-[#4338FF]/10"><CardHeader><CardTitle>Origens</CardTitle></CardHeader><CardContent className="p-0">{data.sources.length ? <Table><TableHeader><TableRow><TableHead>UTM source</TableHead><TableHead className="text-right">Acessos</TableHead><TableHead className="text-right">Visitantes</TableHead></TableRow></TableHeader><TableBody>{data.sources.map((source) => <TableRow key={source.label}><TableCell className="font-medium">{source.label || "Direto"}</TableCell><TableCell className="text-right">{formatNumber(source.views)}</TableCell><TableCell className="text-right">{formatNumber(source.visitors)}</TableCell></TableRow>)}</TableBody></Table> : <p className="px-6 py-12 text-center text-sm text-muted-foreground">Nenhuma origem registrada.</p>}</CardContent></Card>
          <Card className="overflow-hidden border-[#4338FF]/10"><CardHeader><CardTitle>Campanhas</CardTitle></CardHeader><CardContent className="p-0">{data.campaigns.length ? <Table><TableHeader><TableRow><TableHead>UTM campaign</TableHead><TableHead className="text-right">Acessos</TableHead><TableHead className="text-right">Visitantes</TableHead></TableRow></TableHeader><TableBody>{data.campaigns.map((campaign) => <TableRow key={campaign.label}><TableCell className="font-medium">{campaign.label}</TableCell><TableCell className="text-right">{formatNumber(campaign.views)}</TableCell><TableCell className="text-right">{formatNumber(campaign.visitors)}</TableCell></TableRow>)}</TableBody></Table> : <p className="px-6 py-12 text-center text-sm text-muted-foreground">Nenhuma campanha UTM registrada.</p>}</CardContent></Card>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">Métricas próprias da Omi. Visitantes são identificadores anônimos; IP e user-agent bruto não são armazenados. Navegadores com “Do Not Track” ativo não enviam eventos.</p>
      </> : null}
    </div>
  )
}
