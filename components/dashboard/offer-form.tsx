"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CopyPlus, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DashboardOffer, PagedResponse, dashboardFetcher, dashboardMutation } from "@/lib/dashboard-api"

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

function decimalPriceToCents(value?: string) {
  if (!value) return null
  const price = Number(value)
  return Number.isFinite(price) ? Math.round(price * 100) : null
}

function maskedPriceToCents(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10)
  return digits ? Number.parseInt(digits, 10) : null
}

export function OfferForm({ offer, onSaved }: { offer?: DashboardOffer; onSaved?: (saved: DashboardOffer) => void | Promise<void> }) {
  const [copyEnabled, setCopyEnabled] = useState(false)
  const [sourceSlug, setSourceSlug] = useState("")
  const { data, error, isLoading } = useSWR<PagedResponse<DashboardOffer>>(
    !offer && copyEnabled ? "/api/backoffice/offers?page_size=100" : null,
    dashboardFetcher,
  )
  const sourceOffer = data?.results.find((item) => item.slug === sourceSlug)

  if (offer) return <OfferEditor offer={offer} onSaved={onSaved} />

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
              <CopyPlus className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <Label htmlFor="copy-offer" className="cursor-pointer text-sm font-semibold">
                Preencher oferta a partir de outra
              </Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Copie os dados de uma oferta existente e ajuste apenas o necessário.
              </p>
            </div>
          </div>
          <Switch
            id="copy-offer"
            checked={copyEnabled}
            onCheckedChange={(checked) => {
              setCopyEnabled(checked)
              if (!checked) setSourceSlug("")
            }}
          />
        </div>

        {copyEnabled ? (
          <div className="mt-5 border-t pt-5">
            <Label htmlFor="source-offer">Oferta a copiar</Label>
            <Select value={sourceSlug} onValueChange={setSourceSlug} disabled={isLoading || Boolean(error)}>
              <SelectTrigger id="source-offer" aria-label="Oferta a copiar" className="mt-2">
                <SelectValue placeholder={isLoading ? "Carregando ofertas..." : "Selecione uma oferta"} />
              </SelectTrigger>
              <SelectContent>
                {data?.results.map((item) => (
                  <SelectItem key={item.id} value={item.slug}>
                    {item.name} · {item.kind === "SUBSCRIPTION" ? "Assinatura" : "Pagamento único"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error ? <p className="mt-2 text-sm text-destructive">Não foi possível carregar as ofertas.</p> : null}
            {!isLoading && !error && data?.results.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Nenhuma oferta disponível para copiar.</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <OfferEditor key={sourceOffer?.id ?? "new-offer"} initialValues={sourceOffer} onSaved={onSaved} />
    </div>
  )
}

function OfferEditor({ offer, initialValues, onSaved }: { offer?: DashboardOffer; initialValues?: DashboardOffer; onSaved?: (saved: DashboardOffer) => void | Promise<void> }) {
  const values = offer ?? initialValues
  const router = useRouter(); const [saving, setSaving] = useState(false); const [deleting, setDeleting] = useState(false); const [error, setError] = useState("")
  const [kind, setKind] = useState(values?.kind ?? "SUBSCRIPTION"); const [cycle, setCycle] = useState(values?.cycle ?? "MONTHLY")
  const [active, setActive] = useState(values?.is_active ?? true); const [featured, setFeatured] = useState(values?.is_featured ?? false)
  async function submit(formData: FormData) { setSaving(true); setError(""); const body = { name: formData.get("name"), slug: formData.get("slug"), short_description: formData.get("short_description"), description: formData.get("description"), price: formData.get("price"), sort_order: Number(formData.get("sort_order") || 0), monthly_change_request_limit: Number(formData.get("monthly_change_request_limit") || 0), features: String(formData.get("features") ?? "").split("\n").map(v => v.trim()).filter(Boolean), kind, cycle, is_active: active, is_featured: featured }; try { const saved = await dashboardMutation<DashboardOffer>(offer ? `/api/backoffice/offers/${offer.slug}` : "/api/backoffice/offers", { method: offer ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); await onSaved?.(saved); toast.success(offer ? "Oferta atualizada com sucesso." : "Oferta criada com sucesso."); router.replace(offer ? "/dashboard/ofertas" : `/dashboard/ofertas/${saved.slug}/editar`); router.refresh() } catch (err) { const message = err instanceof Error ? err.message : "Não foi possível salvar"; setError(message); toast.error(offer ? "A oferta não foi atualizada." : "A oferta não foi criada.", { description: message }) } finally { setSaving(false) } }
  async function remove() {
    if (!offer || !confirm("Excluir esta oferta?")) return
    setDeleting(true); setError("")
    try {
      await dashboardMutation(`/api/backoffice/offers/${offer.slug}`, { method: "DELETE" })
      toast.success("Oferta excluída com sucesso.")
      router.replace("/dashboard/ofertas")
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível excluir a oferta."
      setError(message)
      toast.error("A oferta não foi excluída.", { description: message })
    } finally {
      setDeleting(false)
    }
  }
  return <form action={submit} className="grid gap-6 rounded-xl border bg-card p-6 md:grid-cols-2">
    <Field name="name" label="Nome" defaultValue={values?.name} required /><Field name="slug" label="Slug" defaultValue={values?.slug} />
    <div className="space-y-2 md:col-span-2"><Label htmlFor="short_description">Resumo</Label><Input id="short_description" name="short_description" defaultValue={values?.short_description} required /></div>
    <div className="space-y-2 md:col-span-2"><Label htmlFor="description">Descrição</Label><Textarea id="description" name="description" defaultValue={values?.description} rows={5} /></div>
    <div className="space-y-2"><Label htmlFor="kind">Tipo</Label><Select value={kind} onValueChange={(value) => setKind(value as "SUBSCRIPTION" | "ONE_TIME")}><SelectTrigger id="kind" aria-label="Tipo"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SUBSCRIPTION">Assinatura</SelectItem><SelectItem value="ONE_TIME">Pagamento único</SelectItem></SelectContent></Select></div>
    <div className="space-y-2"><Label htmlFor="cycle">Ciclo</Label><Select value={cycle} onValueChange={setCycle} disabled={kind === "ONE_TIME"}><SelectTrigger id="cycle" aria-label="Ciclo"><SelectValue /></SelectTrigger><SelectContent>{[["WEEKLY","Semanal"],["BIWEEKLY","Quinzenal"],["MONTHLY","Mensal"],["BIMONTHLY","Bimestral"],["QUARTERLY","Trimestral"],["SEMIANNUALLY","Semestral"],["YEARLY","Anual"]].map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>
    <CurrencyField defaultValue={values?.price} /><Field name="sort_order" label="Ordem" type="number" defaultValue={String(values?.sort_order ?? 0)} />
    <Field name="monthly_change_request_limit" label="Alterações permitidas por mês" type="number" min="0" defaultValue={String(values?.monthly_change_request_limit ?? 0)} required />
    <div className="space-y-2 md:col-span-2"><Label htmlFor="features">Benefícios (um por linha)</Label><Textarea id="features" name="features" rows={6} defaultValue={values?.features.join("\n")} /></div>
    <Toggle label="Oferta ativa" value={active} setValue={setActive} /><Toggle label="Em destaque" value={featured} setValue={setFeatured} />
    {error ? <p className="text-sm text-destructive md:col-span-2">{error}</p> : null}
    <div className="flex justify-between md:col-span-2">{offer ? <Button type="button" variant="destructive" disabled={saving || deleting} onClick={remove}>{deleting ? <><Loader2 className="animate-spin" />Excluindo</> : <><Trash2 />Excluir</>}</Button> : <span />}<Button disabled={saving || deleting}>{saving ? <><Loader2 className="animate-spin" />Salvando</> : "Salvar oferta"}</Button></div>
  </form>
}
function CurrencyField({ defaultValue }: { defaultValue?: string }) {
  const [cents, setCents] = useState<number | null>(() => decimalPriceToCents(defaultValue))
  return <div className="space-y-2">
    <Label htmlFor="price">Preço</Label>
    <Input
      id="price"
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder="R$ 0,00"
      value={cents === null ? "" : brlFormatter.format(cents / 100)}
      onChange={(event) => setCents(maskedPriceToCents(event.target.value))}
      required
    />
    <input type="hidden" name="price" value={cents === null ? "" : (cents / 100).toFixed(2)} />
  </div>
}
function Field({ name, label, ...props }: { name: string; label: string } & React.ComponentProps<typeof Input>) { return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} {...props} /></div> }
function Toggle({ label, value, setValue }: { label: string; value: boolean; setValue: (value: boolean) => void }) { return <div className="flex items-center justify-between rounded-lg border p-4"><Label>{label}</Label><Switch aria-label={label} checked={value} onCheckedChange={setValue} /></div> }
