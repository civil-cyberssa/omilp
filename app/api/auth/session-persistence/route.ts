import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { AUTH_SESSION_COOKIE } from "@/lib/auth-config"

export async function POST() {
  const cookieStore = await cookies()
  const sessionCookies = cookieStore
    .getAll()
    .filter(({ name }) => name === AUTH_SESSION_COOKIE || name.startsWith(`${AUTH_SESSION_COOKIE}.`))

  if (sessionCookies.length === 0) {
    return NextResponse.json({ error: "Sessão não encontrada." }, { status: 401 })
  }

  for (const sessionCookie of sessionCookies) {
    cookieStore.set({
      name: sessionCookie.name,
      value: sessionCookie.value,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    })
  }

  return NextResponse.json({ ok: true })
}
