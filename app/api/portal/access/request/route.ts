import type { NextRequest } from "next/server"

import { apiError, readUpstreamJson, withRouteErrorHandling } from "@/lib/api-response"
import { sendPortalAccessEmail } from "@/lib/contact-email-service"
import { backendEndpoint, validateMutationOrigin } from "@/lib/server-auth"

export async function POST(request: NextRequest) {
  return withRouteErrorHandling("POST /api/portal/access/request", async () => {
    if (!validateMutationOrigin(request)) return apiError(403, "INVALID_ORIGIN", { message: "Origem inválida." })
    const { email } = await request.json()
    const portalAccessKey = process.env.PORTAL_ACCESS_KEY
    if (!portalAccessKey) return apiError(500, "PORTAL_ACCESS_NOT_CONFIGURED", { message: "A chave de acesso do portal não está configurada." })
    const backend = await fetch(backendEndpoint("/api/v1/portal/access/request/"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Portal-Internal-Key": portalAccessKey,
      },
      body: JSON.stringify({ email }), cache: "no-store",
    })
    if (backend.status === 429) {
      return Response.json({ detail: "Se o e-mail estiver cadastrado, você receberá o link de acesso." })
    }
    const parsed = await readUpstreamJson<{ found: boolean; name: string; email: string; token: string }>(backend)
    if (parsed.error) return parsed.error
    if (parsed.data.found) await sendPortalAccessEmail(parsed.data)
    return Response.json({ detail: "Se o e-mail estiver cadastrado, você receberá o link de acesso." })
  })
}
