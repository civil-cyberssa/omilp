import { revalidatePath } from "next/cache"
import type { NextRequest } from "next/server"

import {
  authenticatedBackendRequest,
  forwardRequestBody,
  toNextResponse,
  validateMutationOrigin,
} from "@/lib/server-auth"

type Context = { params: Promise<{ slug: string }> }

export async function GET(request: NextRequest, { params }: Context) {
  const { slug } = await params
  return toNextResponse(
    await authenticatedBackendRequest(
      request,
      `/api/v1/blog/posts/${encodeURIComponent(slug)}/`,
    ),
  )
}

export async function PATCH(request: NextRequest, { params }: Context) {
  if (!validateMutationOrigin(request)) return Response.json({ error: "Origem inválida" }, { status: 403 })
  const { slug } = await params
  const payload = await forwardRequestBody(request)
  const response = await toNextResponse(
    await authenticatedBackendRequest(
      request,
      `/api/v1/blog/posts/${encodeURIComponent(slug)}/`,
      { method: "PATCH", ...payload },
    ),
  )
  if (response.ok) {
    revalidatePath("/blog")
    revalidatePath(`/blog/${slug}`)
    revalidatePath("/blog/[slug]", "page")
  }
  return response
}

export async function DELETE(request: NextRequest, { params }: Context) {
  if (!validateMutationOrigin(request)) return Response.json({ error: "Origem inválida" }, { status: 403 })
  const { slug } = await params
  const response = await toNextResponse(
    await authenticatedBackendRequest(
      request,
      `/api/v1/blog/posts/${encodeURIComponent(slug)}/`,
      { method: "DELETE" },
    ),
  )
  if (response.ok) {
    revalidatePath("/blog")
    revalidatePath(`/blog/${slug}`)
  }
  return response
}
