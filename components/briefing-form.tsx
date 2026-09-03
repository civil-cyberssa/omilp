"use client"

import { CheckCircle2, ExternalLink, Loader2, MessageCircle, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { apiErrorMessage, type PortalBriefing } from "@/lib/portal"

const inputClass = "h-12 border-white/15 bg-white/[.04] text-white placeholder:text-white/30"
const domainOptions = ["Primeira opção", "Segunda opção", "Terceira opção"]

type BriefingFormProps = {
  endpoint?: string
  resource?: { type: "subscription" | "order"; id: string }
  initialData?: PortalBriefing
  method?: "POST" | "PATCH"
  onSuccess?: () => void
}

function domainOption(value = "") {
  return value.replace(/^www\./i, "").replace(/\.com\.br$/i, "")
}

export function BriefingForm({
  endpoint = "/api/checkout/briefing",
  resource,
  initialData,
  method = "POST",
  onSuccess,
}: BriefingFormProps) {
  const router = useRouter()
  const initialExtra = initialData?.extra_data ?? {}
  const initialColors = initialExtra.brand_colors?.hexes?.length
    ? initialExtra.brand_colors.hexes
    : [initialExtra.brand_colors?.hex ?? ""]
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const [hasDomain, setHasDomain] = useState(Boolean(initialExtra.domain?.has_domain))
  const [unsureAboutColors, setUnsureAboutColors] = useState(
    Boolean(initialExtra.brand_colors?.unsure),
  )
  const [brandColors, setBrandColors] = useState(
    initialColors.map((color) => color.replace(/^#/, "")),
  )

  function updateBrandColor(index: number, value: string) {
    const normalized = value.replace(/^#/, "").slice(0, 6)
    setBrandColors((colors) => colors.map((color, colorIndex) => colorIndex === index ? normalized : color))
  }

  function addBrandColor() {
    setBrandColors((colors) => [...colors, ""])
  }

  function removeBrandColor(index: number) {
    setBrandColors((colors) => colors.filter((_, colorIndex) => colorIndex !== index))
  }

  async function submit(formData: FormData) {
    setLoading(true)
    setError("")
    const pages = String(formData.get("desired_pages") ?? "").split(",").map((item) => item.trim()).filter(Boolean)
    const desiredDomains = domainOptions
      .map((_, index) => String(formData.get(`desired_domain_${index + 1}`) ?? "").trim().toLowerCase())
      .filter(Boolean)
      .map((domain) => `www.${domain}.com.br`)
    const colorHexes = brandColors
      .map((color) => color.trim().replace(/^#/, ""))
      .filter(Boolean)
      .map((color) => `#${color.toUpperCase()}`)
    const payload: Record<string, unknown> = {
      project_name: formData.get("project_name"),
      business_description: formData.get("business_description"),
      goals: formData.get("goals"),
      target_audience: formData.get("target_audience"),
      visual_references: formData.get("visual_references"),
      brand_assets_url: formData.get("brand_assets_url"),
      desired_pages: pages,
      extra_data: {
        domain: hasDomain
          ? { has_domain: true, current: String(formData.get("current_domain") ?? "").trim() }
          : { has_domain: false, desired_options: desiredDomains },
        brand_colors: unsureAboutColors
          ? { unsure: true, name: String(formData.get("brand_color_name") ?? "").trim() }
          : { unsure: false, hex: colorHexes[0] ?? "", hexes: colorHexes },
        color_to_avoid: String(formData.get("color_to_avoid") ?? "").trim(),
      },
    }
    if (resource) payload[`${resource.type}_id`] = resource.id
    const response = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    const data = await response.json().catch(() => ({}))
    setLoading(false)
    if (!response.ok) {
      setError(apiErrorMessage(data, "Não foi possível salvar o briefing."))
      return
    }
    if (onSuccess) {
      onSuccess()
      return
    }
    setDone(true)
    router.refresh()
  }

  if (done) return <div className="py-12 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-[#8EA8FF]" /><h2 className="mt-5 text-2xl font-semibold">Briefing recebido.</h2><p className="mt-2 text-white/55">A equipe Omi já pode começar a análise.</p></div>

  return <form action={submit} className="space-y-7">
    <Field name="project_name" label="Nome do projeto" required defaultValue={initialData?.project_name} />
    <Field name="brand_assets_url" label="Link de logos e materiais" type="url" placeholder="Deixe aqui o link do Google Drive" defaultValue={initialData?.brand_assets_url} />
    <Area name="business_description" label="Conte sobre o negócio" required defaultValue={initialData?.business_description} />
    <Area name="goals" label="Objetivos do site" required defaultValue={initialData?.goals} />
    <Area name="target_audience" label="Público-alvo" placeholder="Quem você quer impactar" defaultValue={initialData?.target_audience} />
    <Area name="visual_references" label="Referências visuais" placeholder="Deixe aqui sites que você acha interessantes para referência" defaultValue={initialData?.visual_references} />
    <Field name="desired_pages" label="Páginas desejadas" placeholder="Início, Sobre, Serviços, Contato" defaultValue={initialData?.desired_pages.join(", ")} />

    <section className="space-y-4 rounded-xl border border-white/10 bg-white/[.025] p-4 md:p-5" aria-labelledby="domain-question">
      <div className="flex items-center justify-between gap-5">
        <div><Label id="domain-question" htmlFor="has-domain" className="text-base">Você já possui um domínio?</Label><p className="mt-1 text-sm text-white/45">{hasDomain ? "Sim, já possuo" : "Não, preciso escolher"}</p></div>
        <Switch id="has-domain" checked={hasDomain} onCheckedChange={setHasDomain} aria-label="Já possui um domínio" />
      </div>
      {hasDomain
        ? <Field name="current_domain" label="Qual é o seu domínio?" placeholder="www.suaempresa.com.br" required defaultValue={initialExtra.domain?.current} />
        : <div className="space-y-4"><p className="text-sm text-white/65">Insira até três opções, em ordem de preferência:</p>{domainOptions.map((label, index) => <DomainField key={label} index={index + 1} label={label} required={index === 0} defaultValue={domainOption(initialExtra.domain?.desired_options?.[index])} />)}</div>}
    </section>

    <section className="space-y-4 rounded-xl border border-white/10 bg-white/[.025] p-4 md:p-5" aria-labelledby="brand-color-question">
      <div className="flex items-center justify-between gap-5">
        <div><Label id="brand-color-question" htmlFor="unsure-about-colors" className="text-base">Quais são as cores da sua marca?</Label><p className="mt-1 text-sm text-white/45">Informe as cores principais da identidade visual.</p></div>
        <div className="flex items-center gap-3"><Label htmlFor="unsure-about-colors" className="text-sm text-white/65">Não sei o hexadecimal</Label><Switch id="unsure-about-colors" checked={unsureAboutColors} onCheckedChange={setUnsureAboutColors} aria-label="Não sei o hexadecimal" /></div>
      </div>
      {unsureAboutColors
        ? <Field name="brand_color_name" label="Qual nome melhor descreve a cor?" placeholder="Ex.: azul-marinho, verde-claro" required defaultValue={initialExtra.brand_colors?.name} />
        : <div className="space-y-4">
          {brandColors.map((color, index) => <ColorField key={index} index={index} value={color} onChange={(value) => updateBrandColor(index, value)} onRemove={index > 0 ? () => removeBrandColor(index) : undefined} />)}
          <Button type="button" variant="outline" onClick={addBrandColor} className="border-dashed border-white/20 bg-transparent text-white/70 hover:bg-white/[.06] hover:text-white"><Plus />Adicionar outra cor</Button>
        </div>}
    </section>

    <Field name="color_to_avoid" label="Qual cor evitar no seu projeto?" placeholder="Ex.: vermelho vibrante ou #FF0000" defaultValue={initialExtra.color_to_avoid} />

    <Button asChild variant="outline" className="h-auto min-h-12 w-full whitespace-normal rounded-xl border-emerald-400/25 bg-emerald-400/[.07] px-5 py-3 text-center text-emerald-100 hover:bg-emerald-400/15 hover:text-white">
      <a href="https://wa.me/71992997191" target="_blank" rel="noreferrer"><MessageCircle />Precisa de suporte com o formulário? Entre em contato com nosso WhatsApp<ExternalLink className="opacity-60" /></a>
    </Button>

    {error ? <p role="alert" className="text-sm text-pink-300">{error}</p> : null}
    <Button disabled={loading} className="h-12 w-full rounded-full bg-gradient-to-r from-[#155EEF] via-[#4338FF] to-[#D000B8]">{loading ? <><Loader2 className="animate-spin" />Salvando</> : method === "PATCH" ? "Salvar alterações" : "Enviar briefing"}</Button>
  </form>
}

function Field({ name, label, type = "text", required = false, placeholder, defaultValue }: { name: string; label: string; type?: string; required?: boolean; placeholder?: string; defaultValue?: string }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} className={inputClass} /></div>
}

function Area({ name, label, required = false, placeholder, defaultValue }: { name: string; label: string; required?: boolean; placeholder?: string; defaultValue?: string }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Textarea id={name} name={name} required={required} rows={5} placeholder={placeholder} defaultValue={defaultValue} className="border-white/15 bg-white/[.04] text-white placeholder:text-white/30" /></div>
}

function ColorField({ index, value, onChange, onRemove }: { index: number; value: string; onChange: (value: string) => void; onRemove?: () => void }) {
  const inputId = `brand_color_hex_${index + 1}`
  const label = index === 0 ? "Cor principal em hexadecimal" : `Cor principal ${index + 1} em hexadecimal`
  const pickerValue = /^[0-9a-fA-F]{6}$/.test(value) ? `#${value}` : "#4338FF"

  return <div className="space-y-2">
    <Label htmlFor={inputId}>{label}</Label>
    <div className="flex items-center gap-2">
      <label className="relative grid h-12 w-14 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-md border border-white/15 bg-white/[.07] transition-colors hover:border-white/30" style={{ backgroundColor: pickerValue }}>
        <span className="sr-only">Selecionar {label.toLowerCase()}</span>
        <input type="color" value={pickerValue} onChange={(event) => onChange(event.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label={`Selecionar ${label.toLowerCase()}`} />
        <span className="h-5 w-5 rounded-full border-2 border-white/80 shadow-[0_1px_5px_rgba(0,0,0,.45)]" aria-hidden="true" />
      </label>
      <div className="flex min-w-0 flex-1"><span className="grid h-12 place-items-center rounded-l-md border border-r-0 border-white/15 bg-white/[.07] px-4 text-white/65">#</span><Input id={inputId} name={inputId} value={value} onChange={(event) => onChange(event.target.value)} maxLength={6} pattern="[0-9a-fA-F]{6}" title="Digite seis caracteres hexadecimais, por exemplo 4338FF" placeholder="4338FF" required className={`${inputClass} rounded-l-none font-mono uppercase`} /></div>
      {onRemove ? <Button type="button" variant="ghost" onClick={onRemove} aria-label={`Remover cor principal ${index + 1}`} className="h-12 w-12 shrink-0 text-white/45 hover:bg-pink-400/10 hover:text-pink-200"><Trash2 /></Button> : null}
    </div>
  </div>
}

function DomainField({ index, label, required, defaultValue }: { index: number; label: string; required: boolean; defaultValue?: string }) {
  const name = `desired_domain_${index}`
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><div className="flex"><span className="grid h-12 place-items-center rounded-l-md border border-r-0 border-white/15 bg-white/[.07] px-3 text-sm text-white/55">www.</span><Input id={name} name={name} required={required} pattern="[a-zA-Z0-9-]+" title="Use apenas letras, números e hífens" placeholder="suaempresa" defaultValue={defaultValue} className={`${inputClass} rounded-none`} /><span className="grid h-12 place-items-center rounded-r-md border border-l-0 border-white/15 bg-white/[.07] px-3 text-sm text-white/55">.com.br</span></div></div>
}
