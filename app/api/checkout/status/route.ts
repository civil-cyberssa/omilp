import type { NextRequest } from "next/server"

import { apiError, withRouteErrorHandling } from "@/lib/api-response"
import { passThrough, PURCHASE_COOKIE } from "@/lib/portal-auth"
import { backendEndpoint } from "@/lib/server-auth"

export async function GET(request: NextRequest) {
  return withRouteErrorHandling("GET /api/checkout/status", async () => {
    const purchaseToken = request.cookies.get(PURCHASE_COOKIE)?.value
    if (!purchaseToken) {
      return apiError(404, "PURCHASE_NOT_FOUND", {
        message: "Compra não encontrada.",
      })
    }

    const response = await fetch(backendEndpoint("/api/v1/checkout/status/"), {
      headers: {
        "X-Purchase-Token": purchaseToken,
      },
      cache: "no-store",
    })
    return passThrough(response)
  })
}
