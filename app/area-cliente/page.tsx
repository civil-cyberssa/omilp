import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { CustomerPortal } from "@/components/customer-portal"
import { PORTAL_COOKIE } from "@/lib/auth-config"

export default async function CustomerAreaPage() {
  const cookieStore = await cookies()
  if (!cookieStore.has(PORTAL_COOKIE)) redirect("/area-cliente/entrar")

  return <main className="min-h-screen bg-[radial-gradient(circle_at_15%_0%,rgba(21,94,239,.18),transparent_28%),radial-gradient(circle_at_90%_90%,rgba(208,0,184,.13),transparent_28%),#020617] text-white"><Navbar /><CustomerPortal /><Footer /></main>
}
