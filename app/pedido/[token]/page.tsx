import type { Metadata } from "next"

import Footer from "@/components/footer"
import { ManualOrderCheckout } from "@/components/manual-order-checkout"
import Navbar from "@/components/navbar"

export const metadata: Metadata = {
  title: "Sua oferta",
  robots: { index: false, follow: false },
}

export default async function ManualOrderPage({ params }: { params: Promise<{ token: string }> }) {
  return <main className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(21,94,239,.22),transparent_28%),radial-gradient(circle_at_90%_85%,rgba(208,0,184,.16),transparent_28%),linear-gradient(135deg,#020617,#07143D_58%,#17062D)] text-white"><Navbar /><ManualOrderCheckout token={(await params).token} /><Footer /></main>
}
