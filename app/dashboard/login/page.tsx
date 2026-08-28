"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DashboardLoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError("")
    const form = new FormData(event.currentTarget)
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    })
    if (!response.ok) {
      const payload = await response.json()
      setError(payload.error ?? "Não foi possível entrar.")
      setSubmitting(false)
      return
    }
    const nextPath = new URLSearchParams(window.location.search).get("next")
    router.replace(nextPath?.startsWith("/dashboard") ? nextPath : "/dashboard")
    router.refresh()
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-5 py-12 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(21,94,239,.28),transparent_32%),radial-gradient(circle_at_88%_88%,rgba(208,0,184,.22),transparent_30%),linear-gradient(135deg,#020617_0%,#07143D_55%,#17062D_100%)]" />
      <div className="absolute inset-0 opacity-[.045] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="relative w-full max-w-md border border-white/12 bg-[#07143D]/80 p-7 shadow-[0_30px_100px_rgba(67,56,255,.22)] backdrop-blur-xl md:p-10">
        <div className="flex items-center gap-3"><Image src="/logo_perfil.pnng-removebg-preview.png" alt="Omi" width={42} height={42} /><span className="text-sm font-semibold tracking-wide">Omi Backoffice</span></div>
        <form onSubmit={submit} className="mt-10 space-y-5">
          {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
          <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" autoComplete="email" required className="border-white/12 bg-white/[.04]" /></div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required className="border-white/12 bg-white/[.04] pr-11" />
              <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} aria-pressed={showPassword} className="absolute right-1 top-1/2 flex h-8 w-9 -translate-y-1/2 items-center justify-center rounded-md text-white/45 transition hover:bg-white/[.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4338FF]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={submitting} className="h-11 w-full bg-gradient-to-r from-[#155EEF] via-[#4338FF] to-[#7C2AE8] text-white shadow-[0_12px_35px_rgba(67,56,255,.28)] hover:brightness-110">{submitting ? "Entrando..." : "Entrar"}<ArrowRight className="ml-2 h-4 w-4" /></Button>
        </form>
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-white/28"><LockKeyhole className="h-3.5 w-3.5" /> Sessão protegida e renovada automaticamente</p>
      </div>
    </main>
  )
}
