import { ArrowRight, Check } from "lucide-react"
import Link from "next/link"

import { OfferPrice } from "@/components/offer-price"
import { getOffers } from "@/lib/commerce"

export default async function OffersSection() {
  const offers = await getOffers()
  if (!offers.length) return null
  return (
    <section id="offers" className="relative overflow-hidden bg-[#020617] px-6 py-24 text-[#F8FAFC] md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(21,94,239,.2),transparent_28%),radial-gradient(circle_at_85%_85%,rgba(208,0,184,.15),transparent_28%)]" />
      <div className="container relative mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[.28em] text-[#8EA8FF]">Sites por assinatura</p>
        <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <h2 className="max-w-2xl text-4xl font-semibold tracking-[-.04em] md:text-6xl">Escolha o ponto de partida.</h2>
          <div className="max-w-md leading-7 text-white/60">
            <p>Tenha um site profissional, responsivo e acompanhado por suporte contínuo em um plano recorrente.</p>
            <Link href="/site-por-assinatura" className="mt-3 inline-flex text-sm font-semibold text-[#AFC1FF] underline decoration-white/20 underline-offset-4 transition hover:text-white">
              Entenda como funciona o site por assinatura
            </Link>
          </div>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {offers.map((offer) => (
            <article key={offer.id} className={`relative flex flex-col border p-7 ${offer.is_featured ? "border-[#7C2AE8] bg-[linear-gradient(145deg,rgba(21,94,239,.15),rgba(124,42,232,.12),rgba(208,0,184,.09))] shadow-[0_24px_90px_rgba(67,56,255,.18)]" : "border-white/12 bg-white/[.025]"}`}>
              {offer.is_featured ? <span className="absolute right-5 top-5 text-[10px] font-bold uppercase tracking-[.2em] text-[#D6D3FF]">Recomendado</span> : null}
              <p className="pr-24 text-xs font-semibold uppercase tracking-[.2em] text-white/45">{offer.kind === "SUBSCRIPTION" ? "Assinatura" : "Projeto único"}</p>
              <h3 className="mt-5 text-2xl font-semibold">{offer.name}</h3>
              <p className="mt-3 min-h-12 text-sm leading-6 text-white/55">{offer.short_description}</p>
              <OfferPrice offer={offer} />
              <ul className="mt-7 flex-1 space-y-3 border-t border-white/10 pt-6">
                {offer.features.map((feature) => <li key={feature} className="flex gap-3 text-sm text-white/70"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#8EA8FF]" />{feature}</li>)}
              </ul>
              <Link href={`/contratar/${offer.slug}`} className="mt-8 inline-flex h-12 items-center justify-between rounded-full bg-gradient-to-r from-[#155EEF] via-[#4338FF] to-[#D000B8] px-5 text-sm font-semibold text-white transition hover:brightness-110">Contratar agora <ArrowRight className="h-4 w-4" /></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
