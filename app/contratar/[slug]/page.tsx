import type { Metadata } from "next"
import { Check, MessageCircle } from "lucide-react"
import { notFound } from "next/navigation"

import { CheckoutForm } from "@/components/checkout-form"
import { ConversionLink } from "@/components/conversion-link"
import Footer from "@/components/footer"
import Navbar from "@/components/navbar"
import { OfferPrice } from "@/components/offer-price"
import { formatMoney, formatOfferFeature, getOffer, getOfferDescription, getOfferPricing, type Offer } from "@/lib/commerce"

type Props = { params: Promise<{ slug: string }> }

function OfferBenefits({ offer }: { offer: Offer }) {
  return (
    <ul className="space-y-3 border-t border-white/10 pt-7">
      {offer.features.map((item) => (
        <li key={item} className="flex gap-3 text-sm text-white/68">
          <Check className="h-4 w-4 shrink-0 text-[#8EA8FF]" aria-hidden="true" />
          {formatOfferFeature(item)}
        </li>
      ))}
    </ul>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const offer = await getOffer((await params).slug)
  return { title: offer ? `Contratar ${offer.name}` : "Oferta não encontrada" }
}
export default async function CheckoutPage({ params }: Props) {
  const offer = await getOffer((await params).slug)
  if (!offer) notFound()
  const pricing = getOfferPricing(offer)
  const compactPrice = `${formatMoney(pricing.displayAmount)}${pricing.displayCycle ? `/${pricing.displayCycle}` : ""}`
  const whatsappMessage = `Olá! Quero contratar o plano ${offer.name} da Omi pelo WhatsApp.`
  const whatsappHref = `https://wa.me/5571992997191?text=${encodeURIComponent(whatsappMessage)}`
  return <main className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(21,94,239,.22),transparent_28%),radial-gradient(circle_at_90%_85%,rgba(208,0,184,.16),transparent_28%),linear-gradient(135deg,#020617,#07143D_58%,#17062D)] text-white">
    <Navbar />
    <section className="container mx-auto grid max-w-6xl gap-6 px-6 pb-24 pt-28 lg:grid-cols-[.9fr_1.1fr] lg:gap-12 lg:pt-44">
      <h1 className="sr-only">Contratar plano {offer.name}</h1>
      <details className="rounded-2xl border border-white/12 bg-white/[.045] p-5 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 marker:content-none">
          <span>
            <span className="block text-[10px] font-semibold uppercase tracking-[.22em] text-[#9AA8FF]">Plano selecionado</span>
            <strong className="mt-1 block text-xl">{offer.name}</strong>
          </span>
          <span className="text-right">
            <strong className="block text-lg">{compactPrice}</strong>
            <span className="text-xs text-white/45">Ver detalhes</span>
          </span>
        </summary>
        <p className="mt-5 text-sm leading-6 text-white/58">{getOfferDescription(offer)}</p>
        <div className="mt-5"><OfferBenefits offer={offer} /></div>
      </details>
      <div className="hidden lg:sticky lg:top-32 lg:block lg:self-start">
        <p className="text-xs font-semibold uppercase tracking-[.26em] text-[#8EA8FF]">Sua escolha</p>
        <h2 className="mt-4 text-5xl font-semibold tracking-[-.05em]">{offer.name}</h2>
        <p className="mt-5 max-w-lg leading-7 text-white/58">{getOfferDescription(offer)}</p>
        <OfferPrice offer={offer} className="mt-9" />
        <div className="mt-8"><OfferBenefits offer={offer} /></div>
      </div>
      <div className="border border-white/12 bg-[#020617]/70 p-6 shadow-2xl backdrop-blur-xl md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[.24em] text-[#D6D3FF]">Contratação online</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-.03em] lg:hidden">Assine o plano {offer.name}.</h2>
        <h2 className="mt-3 hidden text-3xl font-semibold tracking-[-.03em] lg:block">Assine em poucos passos.</h2>
        <p className="mb-8 mt-3 text-sm leading-6 text-white/50">Preencha os dados necessários para a cobrança e escolha entre Pix e cartão.</p>
        <div className="mb-8 rounded-2xl border border-emerald-300/20 bg-emerald-300/[.055] p-4">
          <p className="text-sm font-medium text-white/82">Prefere falar com uma pessoa?</p>
          <p className="mt-1 text-xs leading-5 text-white/48">Contrate este plano diretamente com a equipe da Omi.</p>
          <ConversionLink
            href={whatsappHref}
            event="whatsapp_click"
            eventData={{ placement: "checkout", offer: offer.slug, value: Number(offer.price) }}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex h-12 w-full items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/10 px-5 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/55 hover:bg-emerald-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            Contratar pelo WhatsApp
          </ConversionLink>
        </div>
        <div className="mb-8 flex items-center gap-4" aria-hidden="true"><span className="h-px flex-1 bg-white/10" /><span className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/30">ou continue online</span><span className="h-px flex-1 bg-white/10" /></div>
        <CheckoutForm offer={{ slug: offer.slug, cycle: offer.cycle, price: offer.price, kind: offer.kind }} />
      </div>
    </section><Footer />
  </main>
}
