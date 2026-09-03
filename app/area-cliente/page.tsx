import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { CustomerPortal } from "@/components/customer-portal"
import { PORTAL_COOKIE } from "@/lib/auth-config"

export default async function CustomerAreaPage() {
  const cookieStore = await cookies()
  if (!cookieStore.has(PORTAL_COOKIE)) redirect("/area-cliente/entrar")

  return <CustomerPortal />
}
