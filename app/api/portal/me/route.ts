import type { NextRequest } from "next/server"

import { apiError, withRouteErrorHandling } from "@/lib/api-response"
import { clearPortalCookie, passThrough, portalBackendRequest } from "@/lib/portal-auth"
import { validateMutationOrigin } from "@/lib/server-auth"

export async function GET(request: NextRequest) {
  return withRouteErrorHandling("GET /api/portal/me", async () => {
    const response = await passThrough(await portalBackendRequest(request, "/api/v1/portal/me/"))
    if (response.status === 401 || response.status === 403) clearPortalCookie(response)
    return response
  })
}

export async function PATCH(request: NextRequest) {
  return withRouteErrorHandling("PATCH /api/portal/me", async () => {
    if (!validateMutationOrigin(request)) {
      return apiError(403, "INVALID_ORIGIN", { message: "Origem inválida." })
    }
    const response = await passThrough(await portalBackendRequest(request, "/api/v1/portal/me/", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
    }))
    if (response.status === 401 || response.status === 403) clearPortalCookie(response)
    return response
  })
}
