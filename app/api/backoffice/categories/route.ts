import type { NextRequest } from "next/server"

import {
  authenticatedBackendRequest,
  forwardRequestBody,
  toNextResponse,
  validateMutationOrigin,
} from "@/lib/server-auth"

export async function GET(request: NextRequest) {
  return toNextResponse(
    await authenticatedBackendRequest(request, "/api/v1/blog/categories/"),
  )
}

export async function POST(request: NextRequest) {
  if (!validateMutationOrigin(request)) return Response.json({ error: "Origem inválida" }, { status: 403 })
  const payload = await forwardRequestBody(request)
  return toNextResponse(
    await authenticatedBackendRequest(request, "/api/v1/blog/categories/", {
      method: "POST",
      ...payload,
    }),
  )
}
