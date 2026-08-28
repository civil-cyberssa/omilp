import { createHash } from "node:crypto"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { sendContactEmail, type ContactMessage } from "@/lib/contact-email-service"
import { validateMutationOrigin } from "@/lib/server-auth"

export const runtime = "nodejs"

const MAX_BODY_SIZE = 16 * 1024
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 15 * 60 * 1000
const MAX_RATE_LIMIT_KEYS = 10_000
const attempts = new Map<string, { count: number; resetAt: number }>()

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function normalizeInteger(value: unknown) {
  const numberValue = Number(value)
  return Number.isInteger(numberValue) ? numberValue : null
}

function isRateLimited(request: NextRequest) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "unknown"
  const key = createHash("sha256").update(address).digest("hex")
  const now = Date.now()
  const current = attempts.get(key)
  if (!current || current.resetAt <= now) {
    if (!current && attempts.size >= MAX_RATE_LIMIT_KEYS) {
      for (const [attemptKey, attempt] of attempts) {
        if (attempt.resetAt <= now) attempts.delete(attemptKey)
      }
      if (attempts.size >= MAX_RATE_LIMIT_KEYS) return true
    }
    attempts.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  current.count += 1
  return current.count > RATE_LIMIT
}

function hasHeaderControlCharacters(value: string) {
  return /[\u0000-\u001f\u007f]/.test(value)
}

export async function POST(request: NextRequest) {
  if (!validateMutationOrigin(request)) {
    return NextResponse.json({ error: "Origem inválida." }, { status: 403 })
  }

  if (
    request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase()
    !== "application/json"
  ) {
    return NextResponse.json({ error: "Content-Type inválido." }, { status: 415 })
  }

  try {
    const declaredLength = Number(request.headers.get("content-length") ?? 0)
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "Payload excede o limite permitido." }, { status: 413 })
    }
    const rawBody = await request.text()
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "Payload excede o limite permitido." }, { status: 413 })
    }
    let body: Record<string, unknown>
    try {
      const parsedBody: unknown = JSON.parse(rawBody)
      if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
        return NextResponse.json({ error: "JSON inválido." }, { status: 400 })
      }
      body = parsedBody as Record<string, unknown>
    } catch {
      return NextResponse.json({ error: "JSON inválido." }, { status: 400 })
    }

    const contactMessage: ContactMessage = {
      name: normalizeString(body.name),
      email: normalizeString(body.email),
      company: normalizeString(body.company),
      message: normalizeString(body.message),
    }
    const humanAnswer = normalizeString(body.humanAnswer)
    const humanLeft = normalizeInteger(body.humanLeft)
    const humanRight = normalizeInteger(body.humanRight)

    if (normalizeString(body.website)) return NextResponse.json({ ok: true })

    if (isRateLimited(request)) {
      return NextResponse.json(
        { error: "Muitas mensagens enviadas. Tente novamente mais tarde." },
        { status: 429, headers: { "Retry-After": String(RATE_WINDOW_MS / 1000) } },
      )
    }

    if (!contactMessage.name || !contactMessage.email || !contactMessage.message) {
      return NextResponse.json(
        { error: "Preencha nome, e-mail e mensagem." },
        { status: 400 }
      )
    }

    if (!isValidEmail(contactMessage.email)) {
      return NextResponse.json(
        { error: "Informe um e-mail valido." },
        { status: 400 }
      )
    }

    if (
      contactMessage.name.length > 160 ||
      contactMessage.email.length > 254 ||
      (contactMessage.company?.length ?? 0) > 160 ||
      contactMessage.message.length > 5_000 ||
      hasHeaderControlCharacters(contactMessage.name) ||
      hasHeaderControlCharacters(contactMessage.email) ||
      hasHeaderControlCharacters(contactMessage.company ?? "") ||
      /[\u0000\u000b\u000c\u007f]/.test(contactMessage.message)
    ) {
      return NextResponse.json({ error: "Dados de contato inválidos." }, { status: 400 })
    }

    const hasValidChallenge =
      humanLeft !== null &&
      humanRight !== null &&
      humanLeft >= 2 &&
      humanLeft <= 9 &&
      humanRight >= 2 &&
      humanRight <= 9

    if (!hasValidChallenge || Number(humanAnswer) !== humanLeft + humanRight) {
      return NextResponse.json(
        { error: "Responda corretamente a verificacao humana." },
        { status: 400 }
      )
    }
    await sendContactEmail(contactMessage)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Erro ao enviar mensagem de contato", error)

    return NextResponse.json(
      { error: "Nao foi possivel enviar a mensagem agora." },
      { status: 500 }
    )
  }
}
