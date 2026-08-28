import type { NextRequest } from "next/server"

import { apiError, readUpstreamJson, withRouteErrorHandling } from "@/lib/api-response"
import { sendPortalAccessEmail } from "@/lib/contact-email-service"
import { backendEndpoint, validateMutationOrigin } from "@/lib/server-auth"

export async function POST(request: NextRequest) {
  return withRouteErrorHandling("POST /api/portal/access/request", async () => {
    if (!validateMutationOrigin(request)) return apiError(403, "INVALID_ORIGIN", { message: "Origem inválida." })
    const { email } = await request.json()
    const backend = await fetch(backendEndpoint("/api/v1/portal/access/request/"), {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Portal-Internal-Key": process.env.PORTAL_INTERNAL_KEY ?? "" },
      body: JSON.stringify({ email }), cache: "no-store",
    })
    const parsed = await readUpstreamJson<{ found: boolean; name: string; email: string; token: string }>(backend)
    if (parsed.error) return parsed.error
    if (parsed.data.found) await sendPortalAccessEmail(parsed.data)
    return Response.json({ detail: "Se o e-mail estiver cadastrado, você receberá o link de acesso." })
  })
}
