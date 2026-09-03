import type { NextRequest } from "next/server"

import { apiError, withRouteErrorHandling } from "@/lib/api-response"
import { passThrough, portalBackendRequest } from "@/lib/portal-auth"
import { validateMutationOrigin } from "@/lib/server-auth"

const path = (id: string) => `/api/v1/portal/projects/${encodeURIComponent(id)}/change-requests/`

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRouteErrorHandling("GET /api/portal/projects/[id]/change-requests", async () =>
    passThrough(await portalBackendRequest(request, path((await params).id))),
  )
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRouteErrorHandling("POST /api/portal/projects/[id]/change-requests", async () => {
    if (!validateMutationOrigin(request)) return apiError(403, "INVALID_ORIGIN", { message: "Origem inválida." })
    return passThrough(await portalBackendRequest(request, path((await params).id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
    }))
  })
}
