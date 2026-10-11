import type { NextRequest } from "next/server"

import { proxyMutation } from "@/lib/backoffice-proxy"
import { authenticatedBackendRequest, toNextResponse } from "@/lib/server-auth"

export async function GET(request: NextRequest) {
  return toNextResponse(await authenticatedBackendRequest(request, "/api/auth/me/"))
}

export async function PATCH(request: NextRequest) {
  return proxyMutation(request, "/api/auth/me/", "PATCH")
}
