import type { Metadata } from "next"
import { Check } from "lucide-react"
import { notFound } from "next/navigation"

import { CheckoutForm } from "@/components/checkout-form"
import Footer from "@/components/footer"
import Navbar from "@/components/navbar"
import { OfferPrice } from "@/components/offer-price"
import { getOffer } from "@/lib/commerce"

type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const offer = await getOffer((await params).slug)
  return { title: offer ? `Contratar ${offer.name}` : "Oferta não encontrada" }
}
export default async function CheckoutPage({ params }: Props) {
  const offer = await getOffer((await params).slug)
  if (!offer) notFound()
  return <main className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(21,94,239,.22),transparent_28%),radial-gradient(circle_at_90%_85%,rgba(208,0,184,.16),transparent_28%),linear-gradient(135deg,#020617,#07143D_58%,#17062D)] text-white">
    <Navbar />
    <section className="container mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-36 lg:grid-cols-[.9fr_1.1fr] lg:pt-44">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <p className="text-xs font-semibold uppercase tracking-[.26em] text-[#8EA8FF]">Sua escolha</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-.05em]">{offer.name}</h1>
        <p className="mt-5 max-w-lg leading-7 text-white/58">{offer.description || offer.short_description}</p>
        <OfferPrice offer={offer} className="mt-9" />
        <ul className="mt-8 space-y-3 border-t border-white/10 pt-7">{offer.features.map((item) => <li key={item} className="flex gap-3 text-sm text-white/68"><Check className="h-4 w-4 text-[#8EA8FF]" />{item}</li>)}</ul>
      </div>
      <div className="border border-white/12 bg-[#020617]/70 p-6 shadow-2xl backdrop-blur-xl md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[.24em] text-[#D6D3FF]">Identificação</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-.03em]">Vamos preparar seu pedido.</h2>
        <p className="mb-8 mt-3 text-sm leading-6 text-white/50">Informe os dados de cobrança e escolha como deseja pagar.</p>
        <CheckoutForm offer={{ slug: offer.slug, cycle: offer.cycle, price: offer.price }} />
      </div>
    </section><Footer />
  </main>
}
