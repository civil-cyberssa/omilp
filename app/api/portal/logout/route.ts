import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { clearPortalCookie } from "@/lib/portal-auth"
import { validateMutationOrigin } from "@/lib/server-auth"

export async function POST(request: NextRequest) {
  if (!validateMutationOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 })
  const response = NextResponse.json({ logged_out: true })
  clearPortalCookie(response)
  return response
}
