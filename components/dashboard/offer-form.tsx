"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DashboardOffer, dashboardMutation } from "@/lib/dashboard-api"

export function OfferForm({ offer, onSaved }: { offer?: DashboardOffer; onSaved?: (saved: DashboardOffer) => void | Promise<void> }) {
  const router = useRouter(); const [saving, setSaving] = useState(false); const [error, setError] = useState("")
  const [kind, setKind] = useState(offer?.kind ?? "SUBSCRIPTION"); const [cycle, setCycle] = useState(offer?.cycle ?? "MONTHLY")
  const [active, setActive] = useState(offer?.is_active ?? true); const [featured, setFeatured] = useState(offer?.is_featured ?? false)
  async function submit(formData: FormData) { setSaving(true); setError(""); const body = { name: formData.get("name"), slug: formData.get("slug"), short_description: formData.get("short_description"), description: formData.get("description"), price: formData.get("price"), sort_order: Number(formData.get("sort_order") || 0), monthly_change_request_limit: Number(formData.get("monthly_change_request_limit") || 0), features: String(formData.get("features") ?? "").split("\n").map(v => v.trim()).filter(Boolean), kind, cycle, is_active: active, is_featured: featured }; try { const saved = await dashboardMutation<DashboardOffer>(offer ? `/api/backoffice/offers/${offer.slug}` : "/api/backoffice/offers", { method: offer ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); await onSaved?.(saved); toast.success(offer ? "Oferta atualizada com sucesso." : "Oferta criada com sucesso."); router.replace(`/dashboard/ofertas/${saved.slug}/editar`); router.refresh() } catch (err) { const message = err instanceof Error ? err.message : "Não foi possível salvar"; setError(message); toast.error(offer ? "A oferta não foi atualizada." : "A oferta não foi criada.", { description: message }) } finally { setSaving(false) } }
  async function remove() { if (!offer || !confirm("Excluir esta oferta?")) return; await dashboardMutation(`/api/backoffice/offers/${offer.slug}`, { method: "DELETE" }); router.replace("/dashboard/ofertas"); router.refresh() }
  return <form action={submit} className="grid gap-6 rounded-xl border bg-card p-6 md:grid-cols-2">
    <Field name="name" label="Nome" defaultValue={offer?.name} required /><Field name="slug" label="Slug" defaultValue={offer?.slug} />
    <div className="space-y-2 md:col-span-2"><Label htmlFor="short_description">Resumo</Label><Input id="short_description" name="short_description" defaultValue={offer?.short_description} required /></div>
    <div className="space-y-2 md:col-span-2"><Label htmlFor="description">Descrição</Label><Textarea id="description" name="description" defaultValue={offer?.description} rows={5} /></div>
    <div className="space-y-2"><Label>Tipo</Label><Select value={kind} onValueChange={(value) => setKind(value as "SUBSCRIPTION" | "ONE_TIME")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SUBSCRIPTION">Assinatura</SelectItem><SelectItem value="ONE_TIME">Pagamento único</SelectItem></SelectContent></Select></div>
    <div className="space-y-2"><Label>Ciclo</Label><Select value={cycle} onValueChange={setCycle} disabled={kind === "ONE_TIME"}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[["WEEKLY","Semanal"],["BIWEEKLY","Quinzenal"],["MONTHLY","Mensal"],["BIMONTHLY","Bimestral"],["QUARTERLY","Trimestral"],["SEMIANNUALLY","Semestral"],["YEARLY","Anual"]].map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>
    <Field name="price" label="Preço" type="number" step="0.01" defaultValue={offer?.price} required /><Field name="sort_order" label="Ordem" type="number" defaultValue={String(offer?.sort_order ?? 0)} />
    <Field name="monthly_change_request_limit" label="Alterações permitidas por mês" type="number" min="0" defaultValue={String(offer?.monthly_change_request_limit ?? 0)} required />
    <div className="space-y-2 md:col-span-2"><Label htmlFor="features">Benefícios (um por linha)</Label><Textarea id="features" name="features" rows={6} defaultValue={offer?.features.join("\n")} /></div>
    <Toggle label="Oferta ativa" value={active} setValue={setActive} /><Toggle label="Em destaque" value={featured} setValue={setFeatured} />
    {error ? <p className="text-sm text-destructive md:col-span-2">{error}</p> : null}
    <div className="flex justify-between md:col-span-2">{offer ? <Button type="button" variant="destructive" onClick={remove}><Trash2 />Excluir</Button> : <span />}<Button disabled={saving}>{saving ? <><Loader2 className="animate-spin" />Salvando</> : "Salvar oferta"}</Button></div>
  </form>
}
function Field({ name, label, ...props }: { name: string; label: string } & React.ComponentProps<typeof Input>) { return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} {...props} /></div> }
function Toggle({ label, value, setValue }: { label: string; value: boolean; setValue: (value: boolean) => void }) { return <div className="flex items-center justify-between rounded-lg border p-4"><Label>{label}</Label><Switch checked={value} onCheckedChange={setValue} /></div> }
