import type { NextRequest } from "next/server"

import { authenticatedBackendRequest, toNextResponse } from "@/lib/server-auth"

export async function GET(request: NextRequest) {
  return toNextResponse(await authenticatedBackendRequest(request, "/api/auth/me/"))
}
