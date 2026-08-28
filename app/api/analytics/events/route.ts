import { randomUUID } from "node:crypto"
import { type NextRequest, NextResponse } from "next/server"

import { backendEndpoint, validateMutationOrigin } from "@/lib/server-auth"

const VISITOR_COOKIE = "omi_visitor"
const SESSION_COOKIE = "omi_analytics_session"
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

export async function POST(request: NextRequest) {
  if (!validateMutationOrigin(request)) {
    return NextResponse.json({ error: "Origem inválida" }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Evento inválido" }, { status: 400 })
  }

  const currentVisitor = request.cookies.get(VISITOR_COOKIE)?.value
  const currentSession = request.cookies.get(SESSION_COOKIE)?.value
  const visitorId = currentVisitor && UUID_PATTERN.test(currentVisitor) ? currentVisitor : randomUUID()
  const sessionId = currentSession && UUID_PATTERN.test(currentSession) ? currentSession : randomUUID()
  const backendResponse = await fetch(backendEndpoint("/api/v1/analytics/events/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Analytics-Key": process.env.ANALYTICS_INGESTION_KEY ?? "unsafe-development-analytics-key",
      "User-Agent": request.headers.get("user-agent") ?? "",
    },
    body: JSON.stringify({ ...body, visitor_id: visitorId, session_id: sessionId }),
    cache: "no-store",
  })
  const responseBody = await backendResponse.arrayBuffer()
  const response = new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: {
      "Content-Type": backendResponse.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  })
  response.cookies.set(VISITOR_COOKIE, visitorId, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 })
  response.cookies.set(SESSION_COOKIE, sessionId, { ...cookieOptions, maxAge: 30 * 60 })
  return response
}
