import type { NextRequest } from "next/server"

import { proxyUpstreamResponse, withRouteErrorHandling } from "@/lib/api-response"
import { backendEndpoint, validateMutationOrigin } from "@/lib/server-auth"

type RouteContext = { params: Promise<{ slug: string }> }

export async function POST(request: NextRequest, { params }: RouteContext) {
  if (!validateMutationOrigin(request)) {
    return Response.json({ error: "Origem inválida" }, { status: 403 })
  }

  return withRouteErrorHandling("POST /api/blog/posts/[slug]/view", async () => {
    const { slug } = await params
    const headers = new Headers({ "User-Agent": request.headers.get("user-agent") ?? "" })
    const forwardedFor = request.headers.get("x-forwarded-for")
    if (forwardedFor) headers.set("X-Forwarded-For", forwardedFor)

    const response = await fetch(
      backendEndpoint(`/api/v1/blog/posts/${encodeURIComponent(slug)}/views/`),
      { method: "POST", headers, cache: "no-store" },
    )
    return proxyUpstreamResponse(response)
  })
}
