import { type NextRequest, NextResponse } from "next/server"

import {
  backendEndpoint,
  clearAuthCookies,
  REFRESH_COOKIE,
  validateMutationOrigin,
} from "@/lib/server-auth"

export async function POST(request: NextRequest) {
  if (!validateMutationOrigin(request)) {
    return NextResponse.json({ error: "Origem inválida" }, { status: 403 })
  }
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value
  if (refresh) {
    await fetch(backendEndpoint("/api/auth/token/blacklist/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
      cache: "no-store",
    }).catch(() => null)
  }
  const response = NextResponse.json({ authenticated: false })
  clearAuthCookies(response)
  return response
}
