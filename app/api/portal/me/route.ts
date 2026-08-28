import type { NextRequest } from "next/server"

import { withRouteErrorHandling } from "@/lib/api-response"
import { passThrough, portalBackendRequest } from "@/lib/portal-auth"

export async function GET(request: NextRequest) {
  return withRouteErrorHandling("GET /api/portal/me", async () =>
    passThrough(await portalBackendRequest(request, "/api/v1/portal/me/")),
  )
}
