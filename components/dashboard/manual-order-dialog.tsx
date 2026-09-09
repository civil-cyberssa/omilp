"use client"

import { CheckCircle2, Copy, Loader2, Plus, Send } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DashboardOffer, DashboardOrder, PagedResponse, dashboardFetcher, dashboardMutation } from "@/lib/dashboard-api"
import { formatMoney } from "@/lib/commerce"

type CustomerDraft = {
  name: string; email: string; phone: string; cpf_cnpj: string; company: string
  postal_code: string; street: string; address_number: string; address_complement: string
  neighborhood: string; city: string; city_code: string; state: string; country: string
}

const emptyCustomer: CustomerDraft = {
  name: "", email: "", phone: "", cpf_cnpj: "", company: "", postal_code: "",
  street: "", address_number: "", address_complement: "", neighborhood: "", city: "",
  city_code: "", state: "", country: "BR",
}

export function ManualOrderDialog({ onCreated }: { onCreated: () => void }) {
  const { data } = useSWR<PagedResponse<DashboardOffer>>("/api/backoffice/offers?page_size=100", dashboardFetcher)
  const offers = data?.results.filter((offer) => offer.is_active) ?? []
  const [open, setOpen] = useState(false)
  const [offerSlug, setOfferSlug] = useState("")
  const [price, setPrice] = useState("")
  const [hasDiscount, setHasDiscount] = useState(false)
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE")
  const [discount, setDiscount] = useState("")
  const [isPaid, setIsPaid] = useState(false)
  const [fillCustomer, setFillCustomer] = useState(false)
  const [customer, setCustomer] = useState<CustomerDraft>(emptyCustomer)
  const [saving, setSaving] = useState(false)
  const [loadingPostal, setLoadingPostal] = useState(false)
  const [created, setCreated] = useState<DashboardOrder | null>(null)

  const total = useMemo(() => {
    const base = Number(price)
    const discountNumber = hasDiscount ? Number(discount) : 0
    if (!Number.isFinite(base) || !Number.isFinite(discountNumber)) return 0
    return Math.max(0, discountType === "FIXED" ? base - discountNumber : base * (1 - discountNumber / 100))
  }, [discount, discountType, hasDiscount, price])

  function setCustomerField(field: keyof CustomerDraft, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }))
  }

  async function lookupPostalCode() {
    const postalCode = customer.postal_code.replace(/\D/g, "")
    if (postalCode.length !== 8) return
    setLoadingPostal(true)
    try {
      const response = await fetch(`/api/postal-code/${postalCode}`)
      if (!response.ok) throw new Error()
      const address = await response.json() as Partial<CustomerDraft>
      setCustomer((current) => ({ ...current, ...address, postal_code: postalCode }))
    } catch {
      toast.error("Não foi possível consultar o CEP.")
    } finally {
      setLoadingPostal(false)
    }
  }

  function chooseOffer(slug: string) {
    setOfferSlug(slug)
    const offer = offers.find((item) => item.slug === slug)
    if (offer) setPrice(offer.price)
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      const order = await dashboardMutation<DashboardOrder>("/api/backoffice/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offer: offerSlug,
          price,
          has_discount: hasDiscount,
          discount_type: discountType,
          discount_value: hasDiscount ? discount : undefined,
          is_paid: isPaid,
          customer: fillCustomer ? customer : undefined,
        }),
      })
      setCreated(order)
      onCreated()
      toast.success("Pedido manual criado.")
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível criar o pedido.")
    } finally {
      setSaving(false)
    }
  }

  async function share() {
    if (!created?.payment_link) return
    try {
      if (navigator.share) {
        await navigator.share({ title: `Oferta ${created.offer.name}`, text: "Confira sua oferta e prossiga com o pagamento:", url: created.payment_link })
      } else {
        await navigator.clipboard.writeText(created.payment_link)
        toast.success("Link copiado.")
      }
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return
      toast.error("Não foi possível compartilhar o link.")
    }
  }

  function reset() {
    setCreated(null); setOfferSlug(""); setPrice(""); setHasDiscount(false); setDiscountType("PERCENTAGE"); setDiscount("")
    setIsPaid(false); setFillCustomer(false); setCustomer(emptyCustomer)
  }

  return <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) reset() }}>
    <DialogTrigger asChild><Button><Plus className="h-4 w-4" />Novo pedido manual</Button></DialogTrigger>
    <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
      {created ? <div className="space-y-6 py-3 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-600"><CheckCircle2 /></span>
        <DialogHeader className="text-center sm:text-center"><DialogTitle>Pedido criado</DialogTitle><DialogDescription>{created.offer.name} por {formatMoney(created.total)}.</DialogDescription></DialogHeader>
        {created.status === "PAID" ? <p className="rounded-lg bg-muted p-4 text-sm">O pedido já está pago. Pelo link, o cliente preencherá os dados e seguirá para o briefing sem cobrança.</p> : <div className="space-y-3"><Label htmlFor="created-payment-link" className="block text-left">Link da oferta</Label><div className="flex gap-2"><Input id="created-payment-link" readOnly value={created.payment_link} /><Button type="button" variant="outline" onClick={() => { void navigator.clipboard.writeText(created.payment_link); toast.success("Link copiado.") }}><Copy className="h-4 w-4" /><span className="sr-only">Copiar</span></Button></div></div>}
        <Button className="w-full" onClick={share}><Send className="h-4 w-4" />Enviar link da oferta</Button>
      </div> : <>
        <DialogHeader><DialogTitle>Novo pedido manual</DialogTitle><DialogDescription>Defina a condição comercial e escolha se deseja cadastrar o cliente agora ou deixar para o link compartilhado.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-6">
          <section className="grid gap-4 rounded-xl border p-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2"><Label>Oferta</Label><Select value={offerSlug} onValueChange={chooseOffer} required><SelectTrigger><SelectValue placeholder="Selecione uma oferta" /></SelectTrigger><SelectContent>{offers.map((offer) => <SelectItem key={offer.id} value={offer.slug}>{offer.name} · {offer.kind === "SUBSCRIPTION" ? "Assinatura" : "Pagamento único"}</SelectItem>)}</SelectContent></Select></div>
            <Field label="Preço negociado" type="number" min="0.01" step="0.01" value={price} onChange={setPrice} required />
            <div className="flex items-center justify-between rounded-lg border px-4 py-3"><div><Label>Teve desconto?</Label><p className="mt-1 text-xs text-muted-foreground">Aplicar em percentual ou valor</p></div><Switch checked={hasDiscount} onCheckedChange={setHasDiscount} /></div>
            {hasDiscount ? <><div className="space-y-2"><Label>Tipo do desconto</Label><Select value={discountType} onValueChange={(value) => { setDiscountType(value as "PERCENTAGE" | "FIXED"); setDiscount("") }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PERCENTAGE">Porcentagem (%)</SelectItem><SelectItem value="FIXED">Valor fixo (R$)</SelectItem></SelectContent></Select></div><Field label={discountType === "FIXED" ? "Valor do desconto" : "Desconto (%)"} type="number" min="0.01" max={discountType === "PERCENTAGE" ? "99.99" : price || undefined} step="0.01" value={discount} onChange={setDiscount} required /></> : null}
            <div className="flex items-center justify-between rounded-lg border px-4 py-3"><div><Label>Já foi pago?</Label><p className="mt-1 text-xs text-muted-foreground">Libera o briefing sem cobrança</p></div><Switch checked={isPaid} onCheckedChange={setIsPaid} /></div>
            <div className="flex items-end justify-between rounded-lg bg-muted px-4 py-3 md:col-span-2"><span className="text-sm text-muted-foreground">Valor final</span><strong className="text-xl">{formatMoney(total)}</strong></div>
          </section>

          <div className="flex items-center justify-between rounded-xl border px-4 py-3"><div><Label>Preencher dados do cliente agora?</Label><p className="mt-1 text-xs text-muted-foreground">Se desativado, o cliente preencherá tudo pelo link</p></div><Switch checked={fillCustomer} onCheckedChange={setFillCustomer} /></div>
          {fillCustomer ? <section className="space-y-4 rounded-xl border p-4">
            <div><h3 className="font-medium">Dados do cliente</h3><p className="text-xs text-muted-foreground">Esses dados aparecerão preenchidos no link para conferência.</p></div>
            <div className="grid gap-4 md:grid-cols-2">
              <CustomerField label="Nome completo" field="name" customer={customer} setField={setCustomerField} autoComplete="name" required />
              <CustomerField label="E-mail" field="email" customer={customer} setField={setCustomerField} type="email" autoComplete="email" required />
              <CustomerField label="Telefone" field="phone" customer={customer} setField={setCustomerField} autoComplete="tel" required />
              <CustomerField label="CPF ou CNPJ" field="cpf_cnpj" customer={customer} setField={setCustomerField} required />
              <CustomerField label="Empresa (opcional)" field="company" customer={customer} setField={setCustomerField} className="md:col-span-2" />
              <div className="space-y-2"><Label htmlFor="manual-postal-code">CEP</Label><div className="relative"><Input id="manual-postal-code" value={customer.postal_code} onChange={(event) => setCustomerField("postal_code", event.target.value)} onBlur={lookupPostalCode} required />{loadingPostal ? <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" /> : null}</div></div>
              <CustomerField label="Rua" field="street" customer={customer} setField={setCustomerField} required />
              <CustomerField label="Número" field="address_number" customer={customer} setField={setCustomerField} required />
              <CustomerField label="Complemento (opcional)" field="address_complement" customer={customer} setField={setCustomerField} />
              <CustomerField label="Bairro" field="neighborhood" customer={customer} setField={setCustomerField} required />
              <CustomerField label="Cidade" field="city" customer={customer} setField={setCustomerField} required />
              <CustomerField label="Estado" field="state" customer={customer} setField={setCustomerField} maxLength={2} required />
            </div>
          </section> : <p className="rounded-xl border border-dashed bg-muted/40 px-4 py-3 text-sm text-muted-foreground">Nome, contato, documento e endereço ficarão em branco até o cliente abrir o link.</p>}
          <div className="flex justify-end"><Button disabled={saving || !offerSlug}>{saving ? <><Loader2 className="h-4 w-4 animate-spin" />Criando</> : "Criar pedido"}</Button></div>
        </form>
      </>}
    </DialogContent>
  </Dialog>
}

function Field({ label, value, onChange, ...props }: { label: string; value: string; onChange: (value: string) => void } & Omit<React.ComponentProps<typeof Input>, "value" | "onChange">) {
  const id = `manual-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} value={value} onChange={(event) => onChange(event.target.value)} {...props} /></div>
}

function CustomerField({ label, field, customer, setField, className, ...props }: { label: string; field: keyof CustomerDraft; customer: CustomerDraft; setField: (field: keyof CustomerDraft, value: string) => void; className?: string } & Omit<React.ComponentProps<typeof Input>, "value" | "onChange">) {
  return <div className={`space-y-2 ${className ?? ""}`}><Label htmlFor={`manual-customer-${field}`}>{label}</Label><Input id={`manual-customer-${field}`} value={customer[field]} onChange={(event) => setField(field, event.target.value)} {...props} /></div>
}
