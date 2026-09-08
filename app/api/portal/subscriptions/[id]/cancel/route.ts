import type { NextRequest } from "next/server"

import { apiError, withRouteErrorHandling } from "@/lib/api-response"
import { clearPortalCookie, passThrough, portalBackendRequest } from "@/lib/portal-auth"
import { validateMutationOrigin } from "@/lib/server-auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRouteErrorHandling("POST /api/portal/subscriptions/[id]/cancel", async () => {
    if (!validateMutationOrigin(request)) {
      return apiError(403, "INVALID_ORIGIN", { message: "Origem inválida." })
    }
    const { id } = await params
    const response = await passThrough(await portalBackendRequest(
      request,
      `/api/v1/portal/subscriptions/${encodeURIComponent(id)}/cancel/`,
      { method: "POST" },
    ))
    if (response.status === 401 || response.status === 403) clearPortalCookie(response)
    return response
  })
}
