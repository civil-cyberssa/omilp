import type { NextRequest } from "next/server"

import { passThrough, portalBackendRequest } from "@/lib/portal-auth"
import { withRouteErrorHandling } from "@/lib/api-response"

export async function GET(request: NextRequest) {
  return withRouteErrorHandling("GET /api/portal/projects", async () =>
    passThrough(await portalBackendRequest(request, "/api/v1/portal/projects/")),
  )
}
