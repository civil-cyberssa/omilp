import type { Metadata } from "next"

import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import SoftwareGrid from "@/components/software-grid"
import StatsSection from "@/components/stats-section"
import ImmersiveSection from "@/components/immersive-section"
import SolutionsSection from "@/components/solutions-section"
import DigitalLensSection from "@/components/digital-lens-section"
import ClientsSection from "@/components/clients-section"
import ContactForm from "@/components/contact-form"
import Footer from "@/components/footer"
import OffersSection from "@/components/offers-section"

const siteUrl = "https://omitech.com.br"

export const metadata: Metadata = {
  title: "Omi Tecnologia | Software sob medida e sites por assinatura",
  description:
    "Software sob medida, automações e sites profissionais por assinatura para empresas em Salvador, São Paulo e todo o Brasil.",
  alternates: { canonical: "/" },
  keywords: [
    "software sob medida",
    "site por assinatura",
    "site profissional para empresas",
    "desenvolvimento de software",
    "automação de processos",
    "landing page profissional",
    "empresa de tecnologia em Salvador",
  ],
  openGraph: {
    title: "Omi Tecnologia | Software sob medida e sites por assinatura",
    description:
      "Criamos software, automações e sites profissionais por assinatura para empresas que querem crescer.",
    url: siteUrl,
    siteName: "Omi Tecnologia",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omi Tecnologia | Software e sites por assinatura",
    description:
      "Software sob medida, automações e sites profissionais para empresas brasileiras.",
  },
}

const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: `${siteUrl}/`,
      name: "Omi Tecnologia | Software sob medida e sites por assinatura",
      description:
        "Software sob medida, automações e sites profissionais por assinatura para empresas brasileiras.",
      inLanguage: "pt-BR",
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": `${siteUrl}/site-por-assinatura/#service` },
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/site-por-assinatura/#service`,
      name: "Site profissional por assinatura",
      serviceType: "Criação e manutenção de site por assinatura",
      url: `${siteUrl}/site-por-assinatura`,
      description:
        "Criação de site profissional responsivo, preparado para mecanismos de busca e acompanhado por suporte contínuo em um plano recorrente.",
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: { "@type": "Country", name: "Brasil" },
    },
    {
      "@type": "ItemList",
      name: "Principais soluções da Omi Tecnologia",
      itemListElement: [
        "Software sob medida",
        "Sites por assinatura",
        "Landing pages profissionais",
        "Automações e integrações",
      ].map((name, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name,
      })),
    },
  ],
}

function jsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c")
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(homeStructuredData) }}
      />
      <Navbar />
      <HeroSection />
      <SoftwareGrid id="products" />
      <StatsSection />
      <ImmersiveSection />
      <SolutionsSection />
      <OffersSection />
      <DigitalLensSection />
      <ClientsSection />
      <ContactForm />
      <Footer />
    </main>
  )
}
