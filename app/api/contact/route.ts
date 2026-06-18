import { NextResponse } from "next/server"
import { sendContactEmail, type ContactMessage } from "@/lib/contact-email-service"

export const runtime = "nodejs"

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

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const contactMessage: ContactMessage = {
      name: normalizeString(body.name),
      email: normalizeString(body.email),
      company: normalizeString(body.company),
      message: normalizeString(body.message),
    }
    const humanAnswer = normalizeString(body.humanAnswer)
    const humanLeft = normalizeInteger(body.humanLeft)
    const humanRight = normalizeInteger(body.humanRight)

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
