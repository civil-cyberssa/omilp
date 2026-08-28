"use client"

import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatMoney } from "@/lib/commerce"
import {
  type CalendarEventType,
  type CollectionResponse,
  type DashboardCalendarEvent,
  collectionResults,
  dashboardFetcher,
} from "@/lib/dashboard-api"
import { cn } from "@/lib/utils"

const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"]
const eventColors: Record<CalendarEventType, string> = {
  PAYMENT: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CHARGE: "border-amber-200 bg-amber-50 text-amber-700",
  DEADLINE: "border-violet-200 bg-violet-50 text-violet-700",
}
const dotColors: Record<CalendarEventType, string> = {
  PAYMENT: "bg-emerald-500",
  CHARGE: "bg-amber-500",
  DEADLINE: "bg-violet-500",
}

export function CalendarOverview() {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const gridStart = startOfWeek(startOfMonth(visibleMonth))
  const gridEnd = endOfWeek(endOfMonth(visibleMonth))
  const query = `/api/backoffice/calendar-events?start=${format(gridStart, "yyyy-MM-dd")}&end=${format(gridEnd, "yyyy-MM-dd")}`
  const { data: response, error, isLoading } = useSWR<
    CollectionResponse<DashboardCalendarEvent>
  >(
    query,
    dashboardFetcher,
  )
  const events = useMemo(() => collectionResults(response), [response])
  const days = useMemo(
    () => Array.from({ length: 42 }, (_, index) => addDays(gridStart, index)),
    [gridStart],
  )
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, DashboardCalendarEvent[]>()
    for (const event of events) {
      const dayEvents = grouped.get(event.event_date) ?? []
      dayEvents.push(event)
      grouped.set(event.event_date, dayEvents)
    }
    return grouped
  }, [events])
  const selectedEvents = eventsByDate.get(format(selectedDate, "yyyy-MM-dd")) ?? []

  function changeMonth(offset: number) {
    const nextMonth = startOfMonth(addMonths(visibleMonth, offset))
    setVisibleMonth(nextMonth)
    setSelectedDate(nextMonth)
  }

  return (
    <Card className="overflow-hidden border-[#4338FF]/10 shadow-[0_18px_55px_rgba(67,56,255,.07)]">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b bg-gradient-to-r from-[#155EEF]/[.045] via-transparent to-[#D000B8]/[.035]">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-[#4338FF]/10 p-2.5 text-[#4338FF]">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Calendário</p>
            <p className="text-sm text-muted-foreground">Pagamentos, cobranças e prazos</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeMonth(-1)}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="w-32 text-center text-sm font-semibold capitalize sm:w-40">
            {format(visibleMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeMonth(1)}
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 p-3 sm:p-5">
            <div className="grid grid-cols-7">
              {weekdays.map((weekday, index) => (
                <p
                  key={`${weekday}-${index}`}
                  className="pb-2 text-center text-[10px] font-semibold uppercase text-muted-foreground"
                >
                  {weekday}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-7 overflow-hidden rounded-xl border bg-border/60 gap-px">
              {days.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd")
                const dayEvents = eventsByDate.get(dateKey) ?? []
                const selected = isSameDay(day, selectedDate)
                return (
                  <button
                    type="button"
                    key={dateKey}
                    onClick={() => setSelectedDate(day)}
                    aria-label={format(day, "d 'de' MMMM", { locale: ptBR })}
                    className={cn(
                      "min-h-16 bg-background p-1.5 text-left transition hover:bg-[#4338FF]/[.035] sm:min-h-24 sm:p-2",
                      !isSameMonth(day, visibleMonth) && "bg-muted/40 text-muted-foreground",
                      selected && "relative z-10 ring-2 ring-inset ring-[#4338FF]",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        isSameDay(day, new Date()) && "bg-[#4338FF] text-white",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-1 sm:hidden">
                      {dayEvents.slice(0, 3).map((event) => (
                        <span
                          key={event.id}
                          className={cn("h-1.5 w-1.5 rounded-full", dotColors[event.event_type])}
                        />
                      ))}
                    </span>
                    <span className="mt-1 hidden space-y-1 sm:block">
                      {dayEvents.slice(0, 2).map((event) => (
                        <span
                          key={event.id}
                          className={cn(
                            "block truncate rounded border px-1.5 py-0.5 text-[10px] font-medium",
                            eventColors[event.event_type],
                          )}
                        >
                          {event.title}
                        </span>
                      ))}
                      {dayEvents.length > 2 ? (
                        <span className="block pl-1 text-[10px] text-muted-foreground">
                          +{dayEvents.length - 2}
                        </span>
                      ) : null}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {(["PAYMENT", "CHARGE", "DEADLINE"] as const).map((type) => (
                <span key={type} className="flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 rounded-full", dotColors[type])} />
                  {{ PAYMENT: "Pagamento", CHARGE: "Cobrança", DEADLINE: "Prazo" }[type]}
                </span>
              ))}
            </div>
          </div>

          <aside className="border-t bg-muted/25 p-5 xl:border-l xl:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#4338FF]">
              {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
            </p>
            {isLoading ? (
              <div className="mt-5 space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : error ? (
              <p className="mt-5 text-sm text-destructive">Não foi possível carregar a agenda.</p>
            ) : selectedEvents.length === 0 ? (
              <div className="mt-8 text-center">
                <CalendarDays className="mx-auto h-7 w-7 text-muted-foreground/45" />
                <p className="mt-3 text-sm font-medium">Agenda livre</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Nenhum evento para esta data.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {selectedEvents.map((event) => (
                  <article key={event.id} className="rounded-xl border bg-background p-3.5">
                    <div className="flex items-start gap-2">
                      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", dotColors[event.event_type])} />
                      <div className="min-w-0">
                        <p className={cn("text-sm font-medium", event.is_completed && "line-through opacity-55")}>{event.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {event.event_type_label}
                          {event.customer_name ? ` · ${event.customer_name}` : ""}
                        </p>
                        {event.amount !== null ? (
                          <p className="mt-2 text-sm font-semibold">{formatMoney(event.amount)}</p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </aside>
        </div>
      </CardContent>
    </Card>
  )
}
