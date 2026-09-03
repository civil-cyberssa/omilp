"use client"

import { Loader2, UserRound } from "lucide-react"
import { useState } from "react"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { apiErrorMessage, PortalCustomer, PortalData, portalFetcher } from "@/lib/portal"

export function PortalProfile() {
  const { data, error, mutate } = useSWR<PortalData>("/api/portal/me", portalFetcher)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  if (!data && !error) return <Skeleton className="mx-auto h-96 max-w-3xl" />
  if (error) return <p className="text-destructive">Não foi possível carregar seu perfil.</p>

  async function submit(formData: FormData) {
    setSaving(true); setMessage("")
    try {
      const response = await fetch("/api/portal/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: formData.get("name"), company: formData.get("company"), email: formData.get("email"), phone: formData.get("phone") }) })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) { setMessage(apiErrorMessage(payload, "Não foi possível atualizar seus dados.")); return }
      await mutate({ ...data!, customer: payload as PortalCustomer }, { revalidate: false })
      setMessage("Dados atualizados com sucesso.")
    } catch {
      setMessage("Não foi possível atualizar seus dados.")
    } finally {
      setSaving(false)
    }
  }

  const customer = data!.customer
  return <div className="mx-auto max-w-3xl space-y-7"><div><p className="text-sm font-medium text-[#155EEF]">Conta</p><h1 className="mt-1 text-3xl font-semibold">Meu perfil</h1><p className="mt-2 text-muted-foreground">Mantenha seus dados atualizados para receber comunicações do projeto.</p></div><Card><CardHeader className="flex-row items-center gap-3"><span className="rounded-full bg-[#4338FF]/10 p-3 text-[#4338FF]"><UserRound /></span><CardTitle>Dados de contato</CardTitle></CardHeader><CardContent><form action={submit} className="grid gap-5 sm:grid-cols-2"><ProfileField name="name" label="Nome" value={customer.name} required /><ProfileField name="company" label="Empresa" value={customer.company} /><div className="sm:col-span-2"><ProfileField name="email" label="E-mail" value={customer.email} type="email" required /></div><div className="sm:col-span-2"><ProfileField name="phone" label="Telefone com DDD" value={customer.phone} type="tel" /></div>{message ? <p role="status" className="text-sm text-[#4338FF] sm:col-span-2">{message}</p> : null}<div className="flex justify-end sm:col-span-2"><Button disabled={saving}>{saving ? <><Loader2 className="animate-spin" />Salvando</> : "Salvar alterações"}</Button></div></form></CardContent></Card></div>
}
function ProfileField({ name, label, value, type = "text", required = false }: { name: string; label: string; value: string; type?: string; required?: boolean }) { return <div className="space-y-2"><Label htmlFor={`profile-${name}`}>{label}</Label><Input id={`profile-${name}`} name={name} defaultValue={value} type={type} required={required} /></div> }
