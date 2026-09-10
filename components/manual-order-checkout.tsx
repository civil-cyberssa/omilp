"use client"

import { ArrowRight, Check, Loader2, LockKeyhole, Tag } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { CheckoutForm, formatBrazilianDocument, type CheckoutCustomer } from "@/components/checkout-form"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/commerce"

type ManualOrder = {
  id: string
  offer: {
    name: string; slug: string; short_description: string; description: string
    features: string[]; kind: "SUBSCRIPTION" | "ONE_TIME"; cycle: string
  }
  customer: CheckoutCustomer | null
  customer_completed: boolean
  base_price: string
  discount_type: "PERCENTAGE" | "FIXED"
  discount_value: string
  discount_percentage: string
  total: string
  status: string
  paid: boolean
  can_checkout: boolean
}

export function ManualOrderCheckout({ token }: { token: string }) {
  const [order, setOrder] = useState<ManualOrder | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    fetch(`/api/manual-orders/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => null)
        if (!response.ok || !payload) throw new Error("Esta oferta não está disponível.")
        if (active) setOrder(payload as ManualOrder)
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Esta oferta não está disponível.") })
    return () => { active = false }
  }, [token])

  if (error) return <section className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-6 text-center"><div><LockKeyhole className="mx-auto h-10 w-10 text-white/40" /><h1 className="mt-5 text-3xl font-semibold">Oferta indisponível</h1><p className="mt-3 text-white/50">{error}</p></div></section>
  if (!order) return <div className="grid min-h-[70vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-[#8EA8FF]" /><span className="sr-only">Carregando oferta</span></div>

  const hasDiscount = Number(order.discount_percentage) > 0
  return <section className="container mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-36 lg:grid-cols-[.9fr_1.1fr] lg:pt-44">
    <div className="lg:sticky lg:top-32 lg:self-start">
      <p className="text-xs font-semibold uppercase tracking-[.26em] text-[#8EA8FF]">Oferta preparada para você</p>
      <h1 className="mt-4 text-5xl font-semibold tracking-[-.05em]">{order.offer.name}</h1>
      <p className="mt-5 max-w-lg leading-7 text-white/58">{order.offer.description || order.offer.short_description}</p>
      <div className="mt-9 border-y border-white/10 py-7">
        {hasDiscount ? <div className="mb-2 flex items-center gap-2 text-sm text-[#9AA8FF]"><Tag className="h-4 w-4" />{order.discount_type === "FIXED" ? `${formatMoney(order.discount_value)} de desconto` : `${Number(order.discount_value).toLocaleString("pt-BR")}% de desconto`} <span className="text-white/35 line-through">{formatMoney(order.base_price)}</span></div> : null}
        <p className="text-5xl font-semibold tracking-[-.05em]">{formatMoney(order.total)}</p>
        {order.offer.kind === "SUBSCRIPTION" ? <p className="mt-2 text-sm text-white/45">Cobrança por período contratado</p> : null}
      </div>
      <ul className="mt-8 space-y-3">{order.offer.features.map((item) => <li key={item} className="flex gap-3 text-sm text-white/68"><Check className="h-4 w-4 shrink-0 text-[#8EA8FF]" />{item}</li>)}</ul>
    </div>
    <div className="border border-white/12 bg-[#020617]/70 p-6 shadow-2xl backdrop-blur-xl md:p-10">
      {order.paid && order.customer_completed ? <div className="flex min-h-96 flex-col items-center justify-center text-center"><span className="grid h-16 w-16 place-items-center rounded-full border border-[#596BFF]/40 bg-[#4338FF]/15"><Check className="h-7 w-7 text-[#9AA8FF]" /></span><p className="mt-6 text-xs font-semibold uppercase tracking-[.24em] text-[#D6D3FF]">Pagamento confirmado</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.03em]">Seu briefing está liberado.</h2><p className="mt-3 max-w-md text-sm leading-6 text-white/50">O pedido já foi registrado como pago. Agora conte para a gente tudo sobre o projeto.</p><Button asChild className="mt-8 h-12 w-full rounded-full bg-gradient-to-r from-[#155EEF] via-[#4338FF] to-[#D000B8]"><Link href="/briefing">Preencher briefing <ArrowRight /></Link></Button></div>
        : order.can_checkout || order.paid ? <><p className="text-xs font-semibold uppercase tracking-[.24em] text-[#D6D3FF]">{order.paid ? "Dados do cliente" : "Identificação e pagamento"}</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.03em]">Preencha seus dados.</h2><p className="mb-8 mt-3 text-sm leading-6 text-white/50">{order.paid ? "O pagamento já está confirmado. Complete seus dados para seguir ao briefing." : "Informe seus dados, escolha a forma de pagamento e siga para o briefing."}</p><CheckoutForm offer={{ slug: order.offer.slug, cycle: order.offer.cycle, price: order.total, kind: order.offer.kind }} endpoint={`/api/manual-orders/${encodeURIComponent(token)}`} initialCustomer={order.customer ? { ...order.customer, cpf_cnpj: formatBrazilianDocument(order.customer.cpf_cnpj) } : undefined} collectPayment={!order.paid} /></>
          : <div className="flex min-h-96 flex-col items-center justify-center text-center"><LockKeyhole className="h-10 w-10 text-white/40" /><h2 className="mt-5 text-3xl font-semibold">Pedido encerrado</h2><p className="mt-3 text-white/50">Este pedido não está mais disponível para pagamento.</p></div>}
    </div>
  </section>
}
