"use client"

import { useState } from "react"
import { Loader2, Mail, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiErrorMessage } from "@/lib/portal"

export function PortalAccessForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function submit(formData: FormData) {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/portal/access/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: formData.get("email") }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(apiErrorMessage(data, "Não foi possível enviar o acesso."))
        return
      }
      setSent(true)
    } catch {
      setError("Não foi possível enviar o acesso. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) return <div role="status" aria-live="polite" className="rounded-xl border border-emerald-300/20 bg-emerald-300/[.07] p-6 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-300/10 text-emerald-200"><MailCheck /></span><p className="mt-4 font-medium text-white">Solicitação recebida.</p><p className="mt-2 text-sm leading-6 text-white/60">Se o e-mail estiver cadastrado, enviaremos um link de acesso.</p></div>

  return <form action={submit} className="space-y-5"><div className="space-y-2"><Label htmlFor="email">E-mail usado na contratação</Label><Input id="email" name="email" type="email" required placeholder="voce@empresa.com" className="h-12 border-white/15 bg-white/[.04] text-white" /></div><Button disabled={loading} className="h-12 w-full rounded-full bg-gradient-to-r from-[#155EEF] via-[#4338FF] to-[#D000B8]">{loading ? <><Loader2 className="animate-spin" />Enviando</> : <><Mail />Enviar link de acesso</>}</Button>{error ? <p role="alert" className="rounded-lg border border-pink-300/15 bg-pink-300/[.06] p-4 text-sm leading-6 text-pink-100">{error}</p> : null}</form>
}
