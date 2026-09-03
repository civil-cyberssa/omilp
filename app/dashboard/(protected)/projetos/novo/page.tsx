import { ProjectForm } from "@/components/dashboard/project-form"

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ type?: string; id?: string }> }) {
  const { type, id } = await searchParams
  const initialSourceType = type === "order" ? "order" : "subscription"
  return <div className="mx-auto max-w-4xl space-y-7"><div><p className="text-sm font-medium text-[#155EEF]">Projetos</p><h1 className="mt-1 text-3xl font-semibold">Novo projeto</h1><p className="mt-2 text-muted-foreground">Vincule o site publicado a uma contratação.</p></div><ProjectForm initialSourceType={initialSourceType} initialSourceId={id ?? ""} /></div>
}
