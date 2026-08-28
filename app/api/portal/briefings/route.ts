import type { NextRequest } from "next/server"

import { apiError, withRouteErrorHandling } from "@/lib/api-response"
import { passThrough, portalBackendRequest } from "@/lib/portal-auth"
import { validateMutationOrigin } from "@/lib/server-auth"

export async function POST(request: NextRequest) {
  return withRouteErrorHandling("POST /api/portal/briefings", async () => {
    if (!validateMutationOrigin(request)) return apiError(403, "INVALID_ORIGIN", { message: "Origem inválida." })
    return passThrough(await portalBackendRequest(request, "/api/v1/portal/briefings/", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
    }))
  })
}
