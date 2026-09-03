"use client"

import { ExternalLink, Eye, EyeOff, Loader2 } from "lucide-react"
import { useState } from "react"
import useSWR from "swr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { ChangeRequestStatus, DashboardChangeRequest, DashboardProject, PagedResponse, dashboardFetcher, dashboardMutation, formatDashboardDateTime } from "@/lib/dashboard-api"

const statusLabels: Record<ChangeRequestStatus, string> = { PENDING: "Pendente", IN_PROGRESS: "Em andamento", COMPLETED: "Concluída", CANCELED: "Cancelada" }

export function ProjectDetail({ id }: { id: string }) {
  const { data: project, error, mutate: mutateProject } = useSWR<DashboardProject>(`/api/backoffice/projects/${id}`, dashboardFetcher)
  const { data: requests, mutate: mutateRequests } = useSWR<PagedResponse<DashboardChangeRequest>>(`/api/backoffice/change-requests?project=${id}&page_size=100`, dashboardFetcher)
  if (error) return <p className="text-destructive">Projeto não encontrado.</p>
  if (!project) return <Skeleton className="mx-auto h-[600px] max-w-6xl" />

  async function updateRequest(requestId: string, status: ChangeRequestStatus) {
    await dashboardMutation(`/api/backoffice/change-requests/${requestId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
    await mutateRequests()
  }

  return <div className="mx-auto max-w-6xl space-y-7">
    <div><p className="text-sm font-medium text-[#155EEF]">Projetos</p><h1 className="mt-1 text-3xl font-semibold">{project.offer_name}</h1><p className="mt-2 text-muted-foreground">{project.customer.name} · {project.customer.email}</p></div>
    <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
      <ProjectInfrastructureForm project={project} onSaved={mutateProject} />
      <Card><CardHeader><CardTitle>Franquia mensal</CardTitle></CardHeader><CardContent><p className="text-4xl font-semibold">{project.change_requests_remaining}</p><p className="mt-1 text-sm text-muted-foreground">restantes de {project.monthly_change_request_limit} neste mês</p><p className="mt-5 text-xs text-muted-foreground">Limite definido no {project.source_type === "subscription" ? "plano da assinatura" : "pedido"}.</p></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Solicitações de alteração</CardTitle></CardHeader><CardContent>{!requests ? <Skeleton className="h-32" /> : requests.results.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma solicitação para este projeto.</p> : <div className="divide-y">{requests.results.map((request) => <div key={request.id} className="grid gap-4 py-5 md:grid-cols-[1fr_210px]"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-medium">{request.title}</h3><Badge variant="secondary">{statusLabels[request.status]}</Badge></div><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{request.description}</p><p className="mt-2 text-xs text-muted-foreground">Enviada em {formatDashboardDateTime(request.created_at)}</p></div><Select value={request.status} onValueChange={(value) => void updateRequest(request.id, value as ChangeRequestStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusLabels).map(([value,label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>)}</div>}</CardContent></Card>
  </div>
}

function ProjectInfrastructureForm({ project, onSaved }: { project: DashboardProject; onSaved: () => Promise<DashboardProject | undefined> }) {
  const [hostingProvider, setHostingProvider] = useState(project.hosting_provider)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  async function save(formData: FormData) {
    setSaving(true); setMessage("")
    try {
      await dashboardMutation(`/api/backoffice/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site: formData.get("site"),
          repository_url: formData.get("repository_url"),
          hosting_provider: hostingProvider,
          domain_access_url: formData.get("domain_access_url"),
          domain_access_username: formData.get("domain_access_username"),
          domain_access_password: formData.get("domain_access_password"),
          notes: formData.get("notes"),
        }),
      })
      await onSaved()
      setMessage("Informações atualizadas.")
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Não foi possível atualizar o projeto.")
    } finally {
      setSaving(false)
    }
  }

  return <Card><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>Infraestrutura e acessos</CardTitle><Badge variant="outline">Somente equipe</Badge></div></CardHeader><CardContent><form action={save} className="grid gap-4 sm:grid-cols-2"><ProjectField id="project-site" name="site" label="Site publicado" value={project.site} type="url" required /><ProjectField id="project-repository" name="repository_url" label="Repositório" value={project.repository_url} type="url" /><div className="space-y-2"><Label>Host de hospedagem</Label><Select value={hostingProvider} onValueChange={(value) => setHostingProvider(value as DashboardProject["hosting_provider"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="VERCEL">Vercel</SelectItem><SelectItem value="AWS">AWS</SelectItem></SelectContent></Select></div><ProjectField id="domain-access-url" name="domain_access_url" label="Link de acesso ao domínio" value={project.domain_access_url} type="url" /><ProjectField id="domain-access-username" name="domain_access_username" label="Usuário do domínio" value={project.domain_access_username} autoComplete="off" /><div className="space-y-2"><Label htmlFor="domain-access-password">Senha do domínio</Label><div className="relative"><Input id="domain-access-password" name="domain_access_password" defaultValue={project.domain_access_password} type={passwordVisible ? "text" : "password"} autoComplete="new-password" className="pr-10" /><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? "Ocultar senha" : "Exibir senha"}>{passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="project-notes">Observações</Label><Textarea id="project-notes" name="notes" rows={5} defaultValue={project.notes} /></div>{project.site ? <a href={project.site} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-primary">Abrir site <ExternalLink className="h-4 w-4" /></a> : null}<div className="flex items-center justify-end gap-3 sm:col-span-2">{message ? <p role="status" className="mr-auto text-sm text-muted-foreground">{message}</p> : null}<Button disabled={saving}>{saving ? <><Loader2 className="animate-spin" />Salvando</> : "Salvar informações"}</Button></div></form></CardContent></Card>
}

function ProjectField({ id, name, label, value, type = "text", required = false, autoComplete }: { id: string; name: string; label: string; value: string; type?: string; required?: boolean; autoComplete?: string }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} name={name} type={type} defaultValue={value} required={required} autoComplete={autoComplete} /></div>
}
