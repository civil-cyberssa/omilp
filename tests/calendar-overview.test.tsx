import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { format } from "date-fns"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CalendarOverview } from "@/components/dashboard/calendar-overview"
import type { DashboardCalendarEvent } from "@/lib/dashboard-api"

const { mutate, useSWR } = vi.hoisted(() => ({
  mutate: vi.fn(),
  useSWR: vi.fn(),
}))

vi.mock("swr", () => ({ default: useSWR }))

const eventDate = format(new Date(), "yyyy-MM-dd")
const existingEvent: DashboardCalendarEvent = {
  id: "event-1",
  title: "Reunião de alinhamento",
  description: "Revisar entregas e definir os próximos passos.",
  event_type: "DEADLINE",
  event_type_label: "Prazo",
  event_date: eventDate,
  is_completed: false,
  order: null,
  subscription: null,
  payment: null,
  invoice: null,
  related_label: "",
  amount: null,
  customer_name: "Cliente Exemplo",
  created_by_name: "Equipe Omi",
  created_at: `${eventDate}T12:00:00Z`,
  updated_at: `${eventDate}T12:00:00Z`,
}

beforeEach(() => {
  mutate.mockResolvedValue(undefined)
  useSWR.mockReturnValue({
    data: { count: 1, next: null, previous: null, results: [existingEvent] },
    error: undefined,
    isLoading: false,
    mutate,
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  mutate.mockReset()
  useSWR.mockReset()
})

describe("calendário do dashboard", () => {
  it("permite visualizar e editar um evento", async () => {
    const updatedEvent = { ...existingEvent, title: "Reunião atualizada", is_completed: true }
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify(updatedEvent),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ))

    render(<CalendarOverview />)
    fireEvent.click(screen.getAllByText("Reunião de alinhamento").at(-1)!)

    expect(await screen.findByText(existingEvent.description)).toBeInTheDocument()
    expect(screen.getByText("Cliente Exemplo")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /editar evento/i }))

    const title = await screen.findByLabelText("Título")
    fireEvent.change(title, { target: { value: "Reunião atualizada" } })
    fireEvent.click(screen.getByLabelText("Evento concluído"))
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/backoffice/calendar-events/event-1",
      expect.objectContaining({ method: "PATCH" }),
    ))
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body))
    expect(body).toMatchObject({ title: "Reunião atualizada", is_completed: true })
    expect(mutate).toHaveBeenCalled()
  })

  it("adiciona um evento na data selecionada", async () => {
    const createdEvent = {
      ...existingEvent,
      id: "event-2",
      title: "Enviar proposta",
    }
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify(createdEvent),
      { status: 201, headers: { "Content-Type": "application/json" } },
    ))

    render(<CalendarOverview />)
    fireEvent.click(screen.getByRole("button", { name: /novo evento/i }))
    fireEvent.change(await screen.findByLabelText("Título"), {
      target: { value: "Enviar proposta" },
    })
    fireEvent.click(screen.getByRole("button", { name: /adicionar evento/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/backoffice/calendar-events",
      expect.objectContaining({ method: "POST" }),
    ))
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body))
    expect(body).toMatchObject({
      title: "Enviar proposta",
      event_type: "DEADLINE",
      event_date: eventDate,
      is_completed: false,
    })
    expect(mutate).toHaveBeenCalled()
  })
})
