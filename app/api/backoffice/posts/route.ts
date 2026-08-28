import type { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"

import {
  authenticatedBackendRequest,
  forwardRequestBody,
  toNextResponse,
  validateMutationOrigin,
} from "@/lib/server-auth"

export async function GET(request: NextRequest) {
  const query = request.nextUrl.search
  return toNextResponse(
    await authenticatedBackendRequest(request, `/api/v1/blog/posts/${query}`),
  )
}

export async function POST(request: NextRequest) {
  if (!validateMutationOrigin(request)) return Response.json({ error: "Origem inválida" }, { status: 403 })
  const payload = await forwardRequestBody(request)
  const response = await toNextResponse(
    await authenticatedBackendRequest(request, "/api/v1/blog/posts/", {
      method: "POST",
      ...payload,
    }),
  )
  if (response.ok) {
    revalidatePath("/blog")
    revalidatePath("/blog/[slug]", "page")
  }
  return response
}
