import type { Metadata } from 'next'
import './globals.css'
import WhatsappButton from '@/components/whatsapp-button'

export const metadata: Metadata = {
  title:
    'Omi Tecnologia - Desenvolvimento de Sites e Sistemas em Salvador',
  description:
    'A Omi é a maior empresa de tecnologia de Salvador. Criamos sites profissionais, sistemas personalizados e soluções digitais completas para impulsionar o seu negócio.',
  keywords: [
    'criar site em salvador',
    'empresas de tecnologia em salvador',
    'maior empresa de tecnologia de salvador',
    'desenvolvimento de software',
    'soluções digitais',
  ],
  generator: 'v0.dev',
  openGraph: {
    title: 'Omi Tecnologia - Desenvolvimento de Sites em Salvador',
    description:
      'Especialistas em soluções digitais para empresas de Salvador e do Brasil.',
    url: 'https://omi.com.br',
    siteName: 'Omi Tecnologia',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt">
      <body>
        {children}
        <WhatsappButton />
      </body>
    </html>
  )
}
