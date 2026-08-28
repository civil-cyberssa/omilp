"use client"

import { useState } from "react"
import { Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PortalAccessForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  async function submit(formData: FormData) {
    setLoading(true)
    const response = await fetch("/api/portal/access/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: formData.get("email") }) })
    const data = await response.json().catch(() => ({}))
    setLoading(false); setMessage(data.detail ?? "Não foi possível enviar o acesso.")
  }
  return <form action={submit} className="space-y-5"><div className="space-y-2"><Label htmlFor="email">E-mail usado na contratação</Label><Input id="email" name="email" type="email" required placeholder="voce@empresa.com" className="h-12 border-white/15 bg-white/[.04] text-white" /></div><Button disabled={loading} className="h-12 w-full rounded-full bg-gradient-to-r from-[#155EEF] via-[#4338FF] to-[#D000B8]">{loading ? <><Loader2 className="animate-spin" />Enviando</> : <><Mail />Enviar link de acesso</>}</Button>{message ? <p className="rounded-lg border border-white/10 bg-white/[.04] p-4 text-sm leading-6 text-white/65">{message}</p> : null}</form>
}
