import type { NextRequest } from "next/server"

import { authenticatedBackendRequest, toNextResponse } from "@/lib/server-auth"

export async function GET(request: NextRequest) {
  const days = request.nextUrl.searchParams.get("days") ?? "30"
  return toNextResponse(
    await authenticatedBackendRequest(
      request,
      `/api/v1/analytics/summary/?days=${encodeURIComponent(days)}`,
    ),
  )
}
