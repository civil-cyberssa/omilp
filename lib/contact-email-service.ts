import nodemailer from "nodemailer"

export type ContactMessage = {
  name: string
  email: string
  company?: string
  message: string
}

function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }

  return value
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export async function sendContactEmail({
  name,
  email,
  company,
  message,
}: ContactMessage) {
  const smtpUser = getRequiredEnv("GMAIL_SMTP_USER")
  const smtpPassword = getRequiredEnv("GMAIL_SMTP_APP_PASSWORD")
  const recipient = getRequiredEnv("CONTACT_RECIPIENT_EMAIL")
  const fromName = process.env.CONTACT_FROM_NAME || "Omi Tecnologia"
  const companyText = company?.trim() || "Nao informado"

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  })

  await transporter.sendMail({
    from: `"${fromName}" <${smtpUser}>`,
    to: recipient,
    replyTo: email,
    subject: `Nova mensagem do site - ${name}`,
    text: [
      "Nova mensagem recebida pelo site da Omi.",
      "",
      `Nome: ${name}`,
      `Email: ${email}`,
      `Empresa: ${companyText}`,
      "",
      "Mensagem:",
      message,
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="margin: 0 0 16px;">Nova mensagem recebida pelo site da Omi</h2>
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Empresa:</strong> ${escapeHtml(companyText)}</p>
        <div style="margin-top: 20px;">
          <strong>Mensagem:</strong>
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        </div>
      </div>
    `,
  })
}

export async function sendPortalAccessEmail({
  name,
  email,
  token,
}: {
  name: string
  email: string
  token: string
}) {
  const smtpUser = getRequiredEnv("GMAIL_SMTP_USER")
  const smtpPassword = getRequiredEnv("GMAIL_SMTP_APP_PASSWORD")
  const fromName = process.env.CONTACT_FROM_NAME || "Omi Tecnologia"
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const accessUrl = `${siteUrl.replace(/\/$/, "")}/area-cliente/acesso?token=${encodeURIComponent(token)}`
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpPassword },
  })

  await transporter.sendMail({
    from: `"${fromName}" <${smtpUser}>`,
    to: email,
    subject: "Seu acesso à área do cliente Omi",
    text: `Olá, ${name}. Acesse sua área do cliente: ${accessUrl}. Este link expira em 15 minutos e pode ser usado uma vez.`,
    html: `<div style="font-family:Arial,sans-serif;background:#020617;color:#f8fafc;padding:32px;border-radius:16px"><p>Olá, ${escapeHtml(name)}.</p><h2 style="margin:8px 0 20px">Acesse sua área do cliente Omi</h2><a href="${escapeHtml(accessUrl)}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:linear-gradient(90deg,#155EEF,#7C2AE8,#D000B8);color:white;text-decoration:none;font-weight:700">Entrar na área do cliente</a><p style="margin-top:20px;color:#cbd5e1;font-size:13px">O link expira em 15 minutos e só pode ser usado uma vez.</p></div>`,
  })
}
