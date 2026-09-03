import type { Metadata } from 'next'
import Script from 'next/script'
import { Suspense } from 'react'
import './globals.css'
import AnalyticsTracker from '@/components/analytics-tracker'
import WhatsappButton from '@/components/whatsapp-button'
import { Toaster } from '@/components/ui/sonner'

const siteUrl = 'https://omitech.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Omi Tecnologia | Software, Landing Pages e Sites Profissionais',
    template: '%s | Omi Tecnologia',
  },
  description:
    'Omi Tecnologia cria software sob medida, landing pages e sites profissionais em Salvador, São Paulo e todo o Brasil. Desenvolvimento web para empresas que querem vender mais.',
  applicationName: 'Omi Tecnologia',
  authors: [
    { name: 'Omi Tecnologia', url: siteUrl },
    { name: 'Matheus Geambastiane', url: 'https://www.linkedin.com/in/matheus-geambastiane-/' },
  ],
  creator: 'Matheus Geambastiane',
  publisher: 'Omi Tecnologia',
  keywords: [
    'omi',
    'omi tecnologia',
    'omitecnologia',
    'omi software',
    'empresa omi',
    'matheus geambastiane',
    'matheus geambastiane engenheiro de software',
    'empresa de matheus geambastiane',
    'empresa de desenvolvimento de software',
    'empresa de software',
    'desenvolvimento de software em salvador',
    'desenvolvimento de sistemas em salvador',
    'empresa de software em salvador',
    'empresa de tecnologia em salvador',
    'criação de sistemas em salvador',
    'criação de sites em salvador',
    'site profissional em salvador',
    'desenvolvimento de landing page em salvador',
    'software sob medida bahia',
    'sistemas personalizados bahia',
    'desenvolvimento de software bahia',
    'desenvolvimento de software brasil',
    'desenvolvimento de software são paulo',
    'desenvolvimento de sistemas são paulo',
    'site profissional em são paulo',
    'site profissional sao paulo',
    'desenvolvimento de landing page',
    'desenvolvimento de landing page são paulo',
    'criação de landing page',
    'criação de landing pages',
    'landing page profissional',
    'site profissional',
    'sites profissionais para empresas',
    'como fazer site',
    'como fazer site profissional',
    'como criar site para empresa',
    'aplicações web para empresas',
    'desenvolvimento web para empresas',
    'automação de processos empresariais',
  ],
  icons: {
    icon: [
      {
        url: '/logo_perfil.pnng-removebg-preview.png',
        type: 'image/png',
        sizes: '500x500',
      },
    ],
    shortcut: '/logo_perfil.pnng-removebg-preview.png',
    apple: [
      {
        url: '/logo_perfil.pnng-removebg-preview.png',
        type: 'image/png',
        sizes: '500x500',
      },
    ],
  },
  category: 'technology',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'Omi Tecnologia | Software, Landing Pages e Sites Profissionais',
    description:
      'Empresa de desenvolvimento de software, landing pages e sites profissionais em Salvador, São Paulo e Brasil.',
    url: siteUrl,
    siteName: 'Omi Tecnologia',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omi Tecnologia | Software e Sites Profissionais',
    description:
      'Software sob medida, landing pages, sites profissionais e automações para empresas em Salvador, São Paulo e Brasil.',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Omi Tecnologia',
      alternateName: ['Omi', 'Omi Tech', 'Omi Tecnologia'],
      url: siteUrl,
      logo: `${siteUrl}/Logo%20Omi_Perfil%20Logo%20Branca%202.png`,
      image: `${siteUrl}/Logo%20Omi_Perfil%20Logo%20Branca%202.png`,
      sameAs: [
        'https://instagram.com/omi.tecnologia',
        'https://www.linkedin.com/company/omitechnology/',
      ],
      founder: { '@id': `${siteUrl}/#matheus-geambastiane` },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+55 71 9 9299-7191',
          contactType: 'sales',
          areaServed: 'BR',
          availableLanguage: ['Portuguese'],
        },
      ],
    },
    {
      '@type': 'Person',
      '@id': `${siteUrl}/#matheus-geambastiane`,
      name: 'Matheus Geambastiane',
      jobTitle: 'Engenheiro de software e empresário',
      url: 'https://www.linkedin.com/in/matheus-geambastiane-/',
      sameAs: ['https://www.linkedin.com/in/matheus-geambastiane-/'],
      worksFor: { '@id': `${siteUrl}/#organization` },
      affiliation: { '@id': `${siteUrl}/#organization` },
      knowsAbout: [
        'Engenharia de software',
        'Desenvolvimento de software',
        'Desenvolvimento web',
        'Landing pages',
        'Sites profissionais',
        'Automação empresarial',
        'Produtos digitais',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Omi Tecnologia',
      alternateName: 'Omi',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'pt-BR',
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${siteUrl}/#professional-service`,
      name: 'Omi Tecnologia',
      url: siteUrl,
      image: `${siteUrl}/Logo%20Omi_Perfil%20Logo%20Branca%202.png`,
      logo: `${siteUrl}/Logo%20Omi_Perfil%20Logo%20Branca%202.png`,
      description:
        'Empresa de Matheus Geambastiane, engenheiro de software e empresário, especializada em desenvolvimento de software, landing pages, sites profissionais, sistemas sob medida, aplicações web e automação de processos em Salvador, São Paulo e Brasil.',
      parentOrganization: { '@id': `${siteUrl}/#organization` },
      areaServed: [
        { '@type': 'City', name: 'Salvador' },
        { '@type': 'State', name: 'Bahia' },
        { '@type': 'City', name: 'São Paulo' },
        { '@type': 'Country', name: 'Brasil' },
      ],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Salvador',
        addressRegion: 'BA',
        addressCountry: 'BR',
      },
      telephone: '+55 71 9 9299-7191',
      sameAs: [
        'https://instagram.com/omi.tecnologia',
        'https://www.linkedin.com/company/omitechnology/',
      ],
      knowsAbout: [
        'Desenvolvimento de software',
        'Desenvolvimento de sistemas',
        'Software sob medida',
        'Landing pages',
        'Sites profissionais',
        'Site profissional em Salvador',
        'Site profissional em São Paulo',
        'Desenvolvimento web',
        'Aplicações web',
        'Automação empresarial',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Serviços de desenvolvimento digital da Omi Tecnologia',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Desenvolvimento de software sob medida',
              description: 'Criação de sistemas, aplicações web, painéis internos e automações para empresas.',
              areaServed: ['Salvador', 'São Paulo', 'Brasil'],
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Desenvolvimento de landing page',
              description: 'Criação de landing pages profissionais, responsivas e orientadas a conversão.',
              areaServed: ['Salvador', 'São Paulo', 'Brasil'],
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Criação de site profissional',
              description: 'Sites profissionais para empresas que precisam de presença digital clara e confiável.',
              areaServed: ['Salvador', 'São Paulo', 'Brasil'],
            },
          },
        ],
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RKLNFK03PK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RKLNFK03PK');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <WhatsappButton />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
