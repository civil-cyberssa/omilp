import type { NextRequest } from "next/server"

import { apiError, withRouteErrorHandling } from "@/lib/api-response"
import { passThrough, portalBackendRequest } from "@/lib/portal-auth"
import { validateMutationOrigin } from "@/lib/server-auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRouteErrorHandling("PATCH /api/portal/briefings/[id]", async () => {
    if (!validateMutationOrigin(request)) {
      return apiError(403, "INVALID_ORIGIN", { message: "Origem inválida." })
    }
    const { id } = await params
    return passThrough(await portalBackendRequest(
      request,
      `/api/v1/portal/briefings/${encodeURIComponent(id)}/`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(await request.json()),
      },
    ))
  })
}
