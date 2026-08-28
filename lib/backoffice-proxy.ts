import type { NextRequest } from "next/server"

import { apiError, withRouteErrorHandling } from "@/lib/api-response"
import {
  authenticatedBackendRequest,
  forwardRequestBody,
  toNextResponse,
  validateMutationOrigin,
} from "@/lib/server-auth"

export async function proxyRead(request: NextRequest, path: string) {
  return withRouteErrorHandling(`GET ${path}`, async () =>
    toNextResponse(await authenticatedBackendRequest(request, `${path}${request.nextUrl.search}`)),
  )
}

export async function proxyMutation(request: NextRequest, path: string, method: string) {
  return withRouteErrorHandling(`${method} ${path}`, async () => {
    if (!validateMutationOrigin(request)) {
      return apiError(403, "INVALID_ORIGIN", { message: "Origem inválida." })
    }
    const payload = method === "DELETE" ? {} : await forwardRequestBody(request)
    return toNextResponse(await authenticatedBackendRequest(request, path, { method, ...payload }))
  })
}
