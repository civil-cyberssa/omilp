"use client"

import { FormEvent, useEffect, useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  type CalendarEventType,
  type DashboardCalendarEvent,
  dashboardMutation,
} from "@/lib/dashboard-api"

type CalendarEventDialogProps = {
  open: boolean
  event: DashboardCalendarEvent | null
  defaultDate: string
  onOpenChange: (open: boolean) => void
  onSaved: (event: DashboardCalendarEvent) => Promise<void> | void
}

export function CalendarEventDialog({
  open,
  event,
  defaultDate,
  onOpenChange,
  onSaved,
}: CalendarEventDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [eventType, setEventType] = useState<CalendarEventType>("DEADLINE")
  const [eventDate, setEventDate] = useState(defaultDate)
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setTitle(event?.title ?? "")
    setDescription(event?.description ?? "")
    setEventType(event?.event_type ?? "DEADLINE")
    setEventDate(event?.event_date ?? defaultDate)
    setCompleted(event?.is_completed ?? false)
    setError("")
  }, [defaultDate, event, open])

  async function submit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    setSaving(true)
    setError("")
    try {
      const saved = await dashboardMutation<DashboardCalendarEvent>(
        event
          ? `/api/backoffice/calendar-events/${encodeURIComponent(event.id)}`
          : "/api/backoffice/calendar-events",
        {
          method: event ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            event_type: eventType,
            event_date: eventDate,
            is_completed: completed,
          }),
        },
      )
      await onSaved(saved)
      onOpenChange(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar o evento.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!saving) onOpenChange(nextOpen) }}>
      <DialogContent className="omi-dashboard border-black/10 bg-white text-[#020617] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{event ? "Editar evento" : "Novo evento"}</DialogTitle>
          <DialogDescription>
            {event
              ? "Atualize as informações exibidas na agenda da equipe."
              : "Adicione uma cobrança, pagamento ou prazo à agenda da equipe."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5">
          {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}

          <div className="space-y-2">
            <Label htmlFor="calendar-event-title">Título</Label>
            <Input
              id="calendar-event-title"
              value={title}
              onChange={(inputEvent) => setTitle(inputEvent.target.value)}
              maxLength={160}
              placeholder="Ex.: Entregar primeira versão do site"
              required
              disabled={saving}
              autoFocus
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={eventType} onValueChange={(value) => setEventType(value as CalendarEventType)} disabled={saving}>
                <SelectTrigger aria-label="Tipo do evento"><SelectValue /></SelectTrigger>
                <SelectContent className="omi-dashboard bg-white text-[#020617]">
                  <SelectItem value="PAYMENT">Pagamento</SelectItem>
                  <SelectItem value="CHARGE">Cobrança</SelectItem>
                  <SelectItem value="DEADLINE">Prazo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar-event-date">Data</Label>
              <Input
                id="calendar-event-date"
                type="date"
                value={eventDate}
                onChange={(inputEvent) => setEventDate(inputEvent.target.value)}
                required
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="calendar-event-description">Descrição</Label>
            <Textarea
              id="calendar-event-description"
              value={description}
              onChange={(inputEvent) => setDescription(inputEvent.target.value)}
              rows={4}
              placeholder="Contexto, responsáveis ou próximos passos."
              disabled={saving}
            />
          </div>

          <label htmlFor="calendar-event-completed" className="flex cursor-pointer items-start gap-3 rounded-xl border bg-muted/25 p-3.5">
            <Checkbox
              id="calendar-event-completed"
              aria-label="Evento concluído"
              checked={completed}
              onCheckedChange={(checked) => setCompleted(checked === true)}
              disabled={saving}
              className="mt-0.5"
            />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-medium"><CheckCircle2 className="h-4 w-4 text-emerald-600" />Evento concluído</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">Marque quando esta atividade já estiver resolvida.</span>
            </span>
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
            <Button type="submit" disabled={saving || !title.trim() || !eventDate}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : event ? "Salvar alterações" : "Adicionar evento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
