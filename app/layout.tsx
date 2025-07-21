import type { Metadata } from 'next'
import './globals.css'
import WhatsappButton from '@/components/whatsapp-button'

export const metadata: Metadata = {
  title: 'Omi',
  description: 'Created with v0',
  generator: 'v0.dev',
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
