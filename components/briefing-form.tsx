"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function BriefingForm({ endpoint = "/api/checkout/briefing", resource }: { endpoint?: string; resource?: { type: "subscription" | "order"; id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  async function submit(formData: FormData) {
    setLoading(true); setError("")
    const pages = String(formData.get("desired_pages") ?? "").split(",").map((item) => item.trim()).filter(Boolean)
    const payload: Record<string, unknown> = {
      project_name: formData.get("project_name"), business_description: formData.get("business_description"),
      goals: formData.get("goals"), target_audience: formData.get("target_audience"),
      visual_references: formData.get("visual_references"), brand_assets_url: formData.get("brand_assets_url"), desired_pages: pages,
    }
    if (resource) payload[`${resource.type}_id`] = resource.id
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    const data = await response.json().catch(() => ({}))
    setLoading(false)
    if (!response.ok) { setError(data.detail ?? "Não foi possível enviar o briefing."); return }
    setDone(true); router.refresh()
  }
  if (done) return <div className="py-12 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-[#8EA8FF]" /><h2 className="mt-5 text-2xl font-semibold">Briefing recebido.</h2><p className="mt-2 text-white/55">A equipe Omi já pode começar a análise.</p></div>
  return <form action={submit} className="grid gap-5 md:grid-cols-2">
    <Field name="project_name" label="Nome do projeto" required />
    <Field name="brand_assets_url" label="Link de logo e materiais" type="url" />
    <Area name="business_description" label="Conte sobre o negócio" required />
    <Area name="goals" label="Objetivos do site" required />
    <Area name="target_audience" label="Público-alvo" />
    <Area name="visual_references" label="Referências visuais" />
    <div className="space-y-2 md:col-span-2"><Label htmlFor="desired_pages">Páginas desejadas</Label><Input id="desired_pages" name="desired_pages" placeholder="Início, Sobre, Serviços, Contato" className="border-white/15 bg-white/[.04] text-white" /></div>
    {error ? <p className="text-sm text-pink-300 md:col-span-2">{error}</p> : null}
    <Button disabled={loading} className="h-12 rounded-full bg-gradient-to-r from-[#155EEF] via-[#4338FF] to-[#D000B8] md:col-span-2">{loading ? <><Loader2 className="animate-spin" />Enviando</> : "Enviar briefing"}</Button>
  </form>
}
function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) { return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} required={required} className="border-white/15 bg-white/[.04] text-white" /></div> }
function Area({ name, label, required = false }: { name: string; label: string; required?: boolean }) { return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Textarea id={name} name={name} required={required} rows={5} className="border-white/15 bg-white/[.04] text-white" /></div> }
