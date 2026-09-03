import type { NextRequest } from "next/server"

import { withRouteErrorHandling } from "@/lib/api-response"
import { passThrough, portalBackendRequest } from "@/lib/portal-auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return withRouteErrorHandling("GET /api/portal/projects/[id]", async () =>
    passThrough(await portalBackendRequest(request, `/api/v1/portal/projects/${encodeURIComponent(id)}/`)),
  )
}
