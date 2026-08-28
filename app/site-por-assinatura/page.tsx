import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  Check,
  Gauge,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import AnalyticsTracker from "@/components/analytics-tracker"
import Footer from "@/components/footer"
import Navbar from "@/components/navbar"
import { OfferPrice } from "@/components/offer-price"
import { getOffers } from "@/lib/commerce"

const siteUrl = "https://omitech.com.br"
const pageUrl = `${siteUrl}/site-por-assinatura`

export const metadata: Metadata = {
  title: "Site por Assinatura: Planos para Empresas",
  description:
    "Tenha um site por assinatura profissional, responsivo e otimizado para o Google. Conheça os planos da Omi e contrate online.",
  keywords: [
    "site por assinatura",
    "site profissional por assinatura",
    "criação de site por assinatura",
    "plano de site mensal",
    "site mensal para empresas",
  ],
  alternates: { canonical: "/site-por-assinatura" },
  openGraph: {
    title: "Site por assinatura para sua empresa | Omi Tecnologia",
    description:
      "Site profissional, responsivo e pronto para crescer. Escolha seu plano e contrate online.",
    url: pageUrl,
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/card_site_sec_2_1.png",
        width: 1254,
        height: 1254,
        alt: "Site por assinatura desenvolvido pela Omi Tecnologia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Site por assinatura para sua empresa | Omi Tecnologia",
    description: "Conheça os planos de site por assinatura da Omi Tecnologia.",
    images: ["/card_site_sec_2_1.png"],
  },
}

const benefits = [
  { icon: Gauge, label: "Rápido e responsivo" },
  { icon: Search, label: "Estrutura preparada para SEO" },
  { icon: ShieldCheck, label: "Suporte contínuo" },
]

const steps = [
  { number: "01", title: "Escolha o plano", text: "Selecione a oferta ideal e conclua a contratação online." },
  { number: "02", title: "Envie o briefing", text: "Conte sobre a empresa, o público e o objetivo do novo site." },
  { number: "03", title: "Acompanhe a criação", text: "Nós cuidamos do design, desenvolvimento e publicação." },
]

const faq = [
  {
    question: "O que é um site por assinatura?",
    answer:
      "É um site profissional contratado por um plano recorrente. Você evita um alto investimento inicial e conta com uma equipe para criar e manter sua presença digital.",
  },
  {
    question: "O site por assinatura aparece no Google?",
    answer:
      "O projeto é desenvolvido com base técnica para indexação, carregamento rápido, responsividade e boas práticas de SEO. O posicionamento também depende da concorrência, do conteúdo e da autoridade do domínio.",
  },
  {
    question: "O site funciona no celular?",
    answer:
      "Sim. Todas as páginas são responsivas e adaptadas para celulares, tablets e computadores.",
  },
  {
    question: "Como começa a criação do site?",
    answer:
      "Depois da contratação, você preenche um briefing com as informações da empresa. A equipe usa esse material para definir conteúdo, visual e estrutura do projeto.",
  },
]

function jsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c")
}

export default async function SitePorAssinaturaPage() {
  const offers = await getOffers()

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: "Site por Assinatura: Planos para Empresas",
        description: "Planos de site por assinatura profissional da Omi Tecnologia.",
        inLanguage: "pt-BR",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${pageUrl}/#service` },
      },
      {
        "@type": "Service",
        "@id": `${pageUrl}/#service`,
        name: "Site por assinatura",
        serviceType: "Criação de site profissional por assinatura",
        description:
          "Criação de sites profissionais, responsivos e preparados para mecanismos de busca em planos recorrentes.",
        provider: { "@id": `${siteUrl}/#organization` },
        areaServed: { "@type": "Country", name: "Brasil" },
        offers: offers.map((offer) => ({
          "@type": "Offer",
          name: offer.name,
          description: offer.short_description,
          price: offer.price,
          priceCurrency: "BRL",
          url: `${siteUrl}/contratar/${offer.slug}`,
          availability: "https://schema.org/InStock",
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Site por assinatura", item: pageUrl },
        ],
      },
    ],
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8fb] text-[#0a1021]">
      <AnalyticsTracker />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <Navbar />

      <section className="relative isolate flex min-h-[680px] items-center overflow-hidden bg-[#02040b] px-6 py-32 text-white md:min-h-[760px] md:py-40">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_25%,rgba(64,56,255,.28),transparent_26%),radial-gradient(circle_at_12%_78%,rgba(208,0,184,.16),transparent_24%)]" />
        <div className="absolute inset-0 -z-10 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />

        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="text-5xl font-semibold leading-[.98] tracking-[-.055em] sm:text-6xl lg:text-[5.8rem]">
              Site por assinatura para sua empresa crescer.
            </h1>
            <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-white/58 md:text-lg">
              Design profissional, tecnologia e suporte contínuo em um plano simples, com contratação online.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="#planos"
                className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-white px-7 text-sm font-semibold text-[#080b16] transition hover:bg-[#dfe5ff]"
              >
                Ver planos e preços <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="#projetos"
                className="inline-flex h-14 items-center justify-center rounded-full border border-white/16 px-7 text-sm font-medium text-white/78 transition hover:border-white/35 hover:bg-white/[.06] hover:text-white"
              >
                Ver projetos
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Benefícios do site por assinatura" className="border-b border-[#11182a]/10 bg-white px-6">
        <div className="container mx-auto grid max-w-6xl divide-y divide-[#11182a]/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          {benefits.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center justify-center gap-3 py-6 text-sm font-medium text-[#222b41] md:px-6">
              <Icon className="h-4 w-4 text-[#4338ff]" aria-hidden="true" />
              {label}
            </div>
          ))}
        </div>
      </section>

      <section id="projetos" className="bg-white px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-[.8fr_1.2fr] md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.22em] text-[#4338ff]">Sites que já saíram do papel</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-.045em] md:text-6xl">Seu negócio merece presença.</h2>
            </div>
            <p className="max-w-lg text-base leading-7 text-[#5a6275] md:justify-self-end">
              Criamos experiências claras, responsivas e alinhadas à identidade de cada marca.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-[1.35fr_.65fr]">
            <figure className="group relative min-h-[380px] overflow-hidden rounded-[26px] bg-[#141414] md:min-h-[560px]">
              <Image
                src="/ijj.png"
                alt="Dashboard do Instituto Joga Junto desenvolvido pela Omi"
                fill
                sizes="(max-width: 768px) 100vw, 65vw"
                className="object-cover object-left-top transition duration-700 group-hover:scale-[1.02]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-7 pb-7 pt-24 text-sm font-medium text-white">
                Instituto Joga Junto <span className="ml-2 text-white/48">Plataforma web</span>
              </figcaption>
            </figure>
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-1">
              <figure className="group relative min-h-[280px] overflow-hidden rounded-[26px] bg-[#edf6ef]">
                <Image
                  src="/lei_da_grana.png"
                  alt="Site Lei da Grana desenvolvido pela Omi"
                  fill
                  sizes="(max-width: 768px) 100vw, 35vw"
                  className="object-cover object-top transition duration-700 group-hover:scale-[1.03]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 to-transparent px-6 pb-6 pt-20 text-sm font-medium text-white">Lei da Grana</figcaption>
              </figure>
              <div className="flex min-h-[220px] flex-col justify-between rounded-[26px] bg-[#eff1ff] p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4338ff] text-white"><Sparkles className="h-4 w-4" aria-hidden="true" /></span>
                <p className="max-w-xs text-2xl font-semibold leading-tight tracking-[-.035em] text-[#11182a]">A próxima experiência pode ser a sua.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="planos" className="relative overflow-hidden bg-[#050711] px-6 py-24 text-white md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(67,56,255,.22),transparent_32%)]" />
        <div className="container relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#8ea8ff]">Planos de site por assinatura</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-.045em] md:text-6xl">Escolha seu ponto de partida.</h2>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-white/52">Selecione uma oferta, pague online e envie o briefing do projeto.</p>
          </div>

          {offers.length ? (
            <div className={`mt-14 grid gap-5 ${offers.length > 2 ? "lg:grid-cols-3" : "mx-auto max-w-4xl md:grid-cols-2"}`}>
              {offers.map((offer) => (
                <article
                  key={offer.id}
                  className={`relative flex flex-col rounded-[26px] border p-7 md:p-8 ${
                    offer.is_featured
                      ? "border-[#6f66ff]/65 bg-[linear-gradient(155deg,rgba(67,56,255,.22),rgba(255,255,255,.055))] shadow-[0_30px_90px_rgba(67,56,255,.18)]"
                      : "border-white/12 bg-white/[.035]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[10px] font-bold uppercase tracking-[.22em] text-white/42">
                      {offer.kind === "SUBSCRIPTION" ? "Assinatura" : "Projeto único"}
                    </p>
                    {offer.is_featured ? <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#17152f]">Mais escolhido</span> : null}
                  </div>
                  <h3 className="mt-7 text-2xl font-semibold tracking-[-.03em]">{offer.name}</h3>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-white/52">{offer.short_description}</p>
                  <OfferPrice offer={offer} />
                  <ul className="mt-7 flex-1 space-y-3 border-t border-white/10 pt-6">
                    {offer.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-sm leading-5 text-white/68">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#8ea8ff]" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/contratar/${offer.slug}`}
                    aria-label={`Contratar ${offer.name}`}
                    className={`mt-8 inline-flex h-13 items-center justify-between rounded-full px-5 py-3.5 text-sm font-semibold transition ${
                      offer.is_featured ? "bg-white text-[#0b1020] hover:bg-[#dfe5ff]" : "bg-[#4338ff] text-white hover:bg-[#564cff]"
                    }`}
                  >
                    Contratar este plano <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-14 max-w-xl rounded-[24px] border border-white/12 bg-white/[.04] p-8 text-center">
              <p className="text-white/65">As ofertas estão sendo atualizadas.</p>
              <a href="https://wa.me/5571992997191" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b1020]">Consultar planos</a>
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#f7f8fb] px-6 py-24 md:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.22em] text-[#4338ff]">Como funciona</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-.045em] md:text-5xl">Do plano ao site no ar.</h2>
            </div>
            <ol className="divide-y divide-[#11182a]/10 border-y border-[#11182a]/10">
              {steps.map((step) => (
                <li key={step.number} className="grid gap-4 py-8 sm:grid-cols-[4rem_1fr]">
                  <span className="text-sm font-bold text-[#4338ff]">{step.number}</span>
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-.025em]">{step.title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#60687b]">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-24 md:py-32">
        <div className="container mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#4338ff]">Perguntas frequentes</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-.045em] md:text-5xl">Antes de começar.</h2>
          </div>
          <div className="divide-y divide-[#11182a]/10 border-y border-[#11182a]/10">
            {faq.map((item, index) => (
              <details key={item.question} className="group" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-semibold tracking-[-.02em] marker:content-none">
                  {item.question}
                  <span className="relative h-6 w-6 shrink-0 rounded-full border border-[#11182a]/15 after:absolute after:left-1/2 after:top-1/2 after:h-px after:w-2.5 after:-translate-x-1/2 after:-translate-y-1/2 after:bg-[#11182a] before:absolute before:left-1/2 before:top-1/2 before:h-2.5 before:w-px before:-translate-x-1/2 before:-translate-y-1/2 before:bg-[#11182a] before:transition group-open:before:rotate-90 group-open:before:opacity-0" />
                </summary>
                <p className="max-w-2xl pb-7 pr-10 text-sm leading-7 text-[#60687b]">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 pb-24 md:pb-32">
        <div className="container relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-[#4338ff] px-7 py-14 text-white md:px-14 md:py-20">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[55px] border-white/10" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.22em] text-white/58">Seu novo site começa aqui</p>
              <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-[-.045em] md:text-6xl">Escolha um plano. A gente cuida do resto.</h2>
            </div>
            <Link href="#planos" className="inline-flex h-14 shrink-0 items-center justify-center gap-3 rounded-full bg-white px-7 text-sm font-semibold text-[#17152f] transition hover:bg-[#eef0ff]">
              Ver ofertas <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
