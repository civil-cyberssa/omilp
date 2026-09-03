"use client"

import { Eye, Pencil } from "lucide-react"
import { useState } from "react"

import { BriefingForm } from "@/components/briefing-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { PortalBriefing } from "@/lib/portal"

type BriefingActionsProps = {
  briefing: PortalBriefing
  onSaved: () => void
}

export function BriefingActions({ briefing, onSaved }: BriefingActionsProps) {
  const [mode, setMode] = useState<"view" | "edit" | null>(null)

  function saved() {
    setMode(null)
    onSaved()
  }

  return (
    <>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Ver briefing ${briefing.project_name}`}
          title="Ver briefing"
          onClick={() => setMode("view")}
          className="text-white/55 hover:bg-white/10 hover:text-white"
        >
          <Eye />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Editar briefing ${briefing.project_name}`}
          title="Editar briefing"
          onClick={() => setMode("edit")}
          className="text-white/55 hover:bg-[#4338FF]/20 hover:text-[#c7c3ff]"
        >
          <Pencil />
        </Button>
      </div>
      <Dialog open={mode !== null} onOpenChange={(open) => { if (!open) setMode(null) }}>
        <DialogContent className="max-h-[88vh] overflow-y-auto border-white/15 bg-[#07112d] text-white shadow-2xl shadow-black/60 sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {mode === "edit" ? "Editar briefing" : briefing.project_name}
            </DialogTitle>
            <DialogDescription className="text-white/50">
              {mode === "edit"
                ? "Atualize as informações que orientam a produção do seu projeto."
                : "Informações enviadas para a equipe Omi."}
            </DialogDescription>
          </DialogHeader>
          {mode === "edit" ? (
            <div className="mt-3">
              <BriefingForm
                endpoint={`/api/portal/briefings/${briefing.id}`}
                method="PATCH"
                initialData={briefing}
                onSuccess={saved}
              />
            </div>
          ) : (
            <BriefingDetails briefing={briefing} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function BriefingDetails({ briefing }: { briefing: PortalBriefing }) {
  const domain = briefing.extra_data.domain
  const colors = briefing.extra_data.brand_colors
  const domainText = domain?.has_domain
    ? domain.current
    : domain?.desired_options?.join(", ")
  const colorsText = colors?.unsure
    ? colors.name
    : (colors?.hexes?.length ? colors.hexes : [colors?.hex]).filter(Boolean).join(", ")

  return (
    <div className="mt-3 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2">
      <Detail label="Nome do projeto" value={briefing.project_name} />
      <Detail label="Páginas desejadas" value={briefing.desired_pages.join(", ")} />
      <Detail label="Sobre o negócio" value={briefing.business_description} wide />
      <Detail label="Objetivos" value={briefing.goals} wide />
      <Detail label="Público-alvo" value={briefing.target_audience} />
      <Detail label="Referências visuais" value={briefing.visual_references} />
      <Detail label="Domínio" value={domainText} />
      <Detail label="Cores da marca" value={colorsText} />
      <Detail label="Cor a evitar" value={briefing.extra_data.color_to_avoid} />
      <Detail label="Materiais da marca" value={briefing.brand_assets_url} link />
    </div>
  )
}

function Detail({
  label,
  value,
  wide = false,
  link = false,
}: {
  label: string
  value?: string
  wide?: boolean
  link?: boolean
}) {
  return (
    <div className={`bg-[#091532] p-4 ${wide ? "sm:col-span-2" : ""}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#8EA8FF]">{label}</p>
      {link && value ? (
        <a href={value} target="_blank" rel="noreferrer" className="mt-2 block break-words text-sm text-white/75 underline decoration-white/25 underline-offset-4 hover:text-white">
          {value}
        </a>
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/72">{value || "Não informado"}</p>
      )}
    </div>
  )
}
