"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DashboardOrder, DashboardProject, DashboardSubscription, PagedResponse, dashboardFetcher, dashboardMutation } from "@/lib/dashboard-api"

export function ProjectForm({ initialSourceType = "subscription", initialSourceId = "" }: { initialSourceType?: "order" | "subscription"; initialSourceId?: string }) {
  const router = useRouter()
  const [sourceType, setSourceType] = useState<"order" | "subscription">(initialSourceType)
  const [sourceId, setSourceId] = useState(initialSourceId)
  const [hostingProvider, setHostingProvider] = useState<"VERCEL" | "AWS">("VERCEL")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const { data: orders } = useSWR<PagedResponse<DashboardOrder>>("/api/backoffice/orders?page_size=100", dashboardFetcher)
  const { data: subscriptions } = useSWR<PagedResponse<DashboardSubscription>>("/api/backoffice/subscriptions?page_size=100", dashboardFetcher)
  const sources = sourceType === "order" ? orders?.results : subscriptions?.results

  async function submit(formData: FormData) {
    if (!sourceId) { setError("Selecione a contratação vinculada."); return }
    setSaving(true); setError("")
    try {
      const project = await dashboardMutation<DashboardProject>("/api/backoffice/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site: formData.get("site"),
          repository_url: formData.get("repository_url"),
          hosting_provider: hostingProvider,
          domain_access_url: formData.get("domain_access_url"),
          domain_access_username: formData.get("domain_access_username"),
          domain_access_password: formData.get("domain_access_password"),
          notes: formData.get("notes"),
          [sourceType]: sourceId,
        }),
      })
      router.replace(`/dashboard/projetos/${project.id}`)
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível criar o projeto")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form action={submit} className="grid gap-6 rounded-xl border bg-card p-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Tipo de contratação</Label>
        <Select value={sourceType} onValueChange={(value) => { setSourceType(value as typeof sourceType); setSourceId("") }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="subscription">Assinatura</SelectItem><SelectItem value="order">Pedido</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Contratação</Label>
        <Select value={sourceId} onValueChange={setSourceId}>
          <SelectTrigger><SelectValue placeholder="Selecione cliente e oferta" /></SelectTrigger>
          <SelectContent>{sources?.map((item) => <SelectItem key={item.id} value={item.id}>{item.customer.name} · {item.offer.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="site">URL publicada</Label>
        <Input id="site" name="site" type="url" placeholder="https://cliente.com.br" required />
      </div>
      <div className="border-t pt-6 md:col-span-2"><p className="font-medium">Infraestrutura</p><p className="mt-1 text-sm text-muted-foreground">Informações internas de código, hospedagem e domínio.</p></div>
      <div className="space-y-2">
        <Label htmlFor="repository_url">Repositório</Label>
        <Input id="repository_url" name="repository_url" type="url" placeholder="https://github.com/empresa/projeto" />
      </div>
      <div className="space-y-2">
        <Label>Host de hospedagem</Label>
        <Select value={hostingProvider} onValueChange={(value) => setHostingProvider(value as "VERCEL" | "AWS")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="VERCEL">Vercel</SelectItem><SelectItem value="AWS">AWS</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="domain_access_url">Link de acesso ao domínio</Label>
        <Input id="domain_access_url" name="domain_access_url" type="url" placeholder="https://painel.registro.br" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="domain_access_username">Usuário do domínio</Label>
        <Input id="domain_access_username" name="domain_access_username" autoComplete="off" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="domain_access_password">Senha do domínio</Label>
        <Input id="domain_access_password" name="domain_access_password" type="password" autoComplete="new-password" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" rows={5} placeholder="Detalhes técnicos e instruções para a equipe." />
      </div>
      {error ? <p className="text-sm text-destructive md:col-span-2">{error}</p> : null}
      <div className="flex justify-end md:col-span-2"><Button disabled={saving}>{saving ? <><Loader2 className="animate-spin" />Criando</> : "Criar projeto"}</Button></div>
    </form>
  )
}
