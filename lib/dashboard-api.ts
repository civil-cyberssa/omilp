import { formatApiError } from "@/lib/client-api-error"

export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export type Category = { id: string; name: string; slug: string }

export type DashboardPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string
  category: Category | null
  author_name: string
  reading_time: number
  view_count: number
  status: PostStatus
  published_at: string | null
  seo_title: string
  seo_description: string
  created_at: string
  updated_at: string
}

export type PagedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type CollectionResponse<T> = T[] | PagedResponse<T>

export function collectionResults<T>(response: CollectionResponse<T> | undefined): T[] {
  if (Array.isArray(response)) return response
  return Array.isArray(response?.results) ? response.results : []
}

export type DashboardSummary = {
  total: number
  draft: number
  published: number
  archived: number
  total_views: number
}

export type AnalyticsSummary = {
  period_days: 7 | 30 | 90
  totals: {
    views: number
    visitors: number
    sessions: number
    conversions: number
    whatsapp_clicks: number
    conversion_rate: number
  }
  daily: Array<{ date: string; views: number; conversions: number }>
  sources: Array<{ label: string; views: number; visitors: number }>
  campaigns: Array<{ label: string; views: number; visitors: number }>
}

export type AuthUser = {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
}

export type DashboardOffer = {
  id: string; name: string; slug: string; short_description: string; description: string
  kind: "SUBSCRIPTION" | "ONE_TIME"; price: string; cycle: string; features: string[]
  is_featured: boolean; is_active: boolean; sort_order: number; created_at: string; updated_at: string
}
export type BillingCustomer = { id: string; name: string; email: string; phone: string; company: string; cpf_cnpj: string }
export type DashboardOrder = {
  id: string; customer: BillingCustomer; offer: DashboardOffer; status: string; billing_type: string
  total: string; due_date: string; notes: string; checkout_url: string; created_at: string; updated_at: string
}
export type DashboardSubscription = {
  id: string; customer: BillingCustomer; offer: DashboardOffer; status: string; billing_type: string
  value: string; cycle: string; next_due_date: string; checkout_url: string; created_at: string; updated_at: string
}

export type DocumentType = "INVOICE" | "CONTRACT" | "DOCUMENT" | "QUOTE" | "OTHER"
export type DashboardDocument = {
  id: string
  name: string
  document_type: DocumentType
  document_type_label: string
  file_url: string
  original_file_name: string
  content_type: string
  file_size: number
  uploaded_by_name: string
  created_at: string
  updated_at: string
}

export type CalendarEventType = "PAYMENT" | "CHARGE" | "DEADLINE"
export type DashboardCalendarEvent = {
  id: string
  title: string
  description: string
  event_type: CalendarEventType
  event_type_label: string
  event_date: string
  is_completed: boolean
  order: string | null
  subscription: string | null
  payment: string | null
  invoice: string | null
  related_label: string
  amount: number | null
  customer_name: string
  created_by_name: string
  created_at: string
  updated_at: string
}

export class DashboardApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) return undefined as T
    return response.json()
  }
  let message = "Não foi possível concluir a operação."
  try {
    const payload = await response.json()
    message = formatApiError(response.status, payload)
  } catch {
    // Mantém a mensagem amigável padrão.
  }
  throw new DashboardApiError(response.status, message)
}

export async function dashboardFetcher<T>(url: string): Promise<T> {
  return parseResponse<T>(await fetch(url, { cache: "no-store" }))
}

export async function dashboardMutation<T>(url: string, init: RequestInit): Promise<T> {
  return parseResponse<T>(await fetch(url, { ...init, cache: "no-store" }))
}

export function formatDashboardDate(value: string | null) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Bahia",
  }).format(new Date(value))
}

export function formatDashboardDateTime(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  const formattedDate = formatDashboardDate(value)
  const formattedTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "America/Bahia",
  }).format(date)
  return `${formattedDate} às ${formattedTime}`
}

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—"
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB", "TB"]
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: value < 10 ? 1 : 0 }).format(value)} ${units[unitIndex]}`
}
