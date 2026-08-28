import type { NextRequest } from "next/server"

import { apiError, withRouteErrorHandling } from "@/lib/api-response"
import { passThrough, PURCHASE_COOKIE } from "@/lib/portal-auth"
import { backendEndpoint, validateMutationOrigin } from "@/lib/server-auth"

export async function POST(request: NextRequest) {
  return withRouteErrorHandling("POST /api/checkout/briefing", async () => {
    if (!validateMutationOrigin(request)) return apiError(403, "INVALID_ORIGIN", { message: "Origem inválida." })
    const purchaseToken = request.cookies.get(PURCHASE_COOKIE)?.value
    if (!purchaseToken) return apiError(401, "PURCHASE_SESSION_MISSING", { message: "Compra não encontrada." })
    const body = { ...(await request.json()), purchase_token: purchaseToken }
    return passThrough(await fetch(backendEndpoint("/api/v1/briefings/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    }))
  })
}
