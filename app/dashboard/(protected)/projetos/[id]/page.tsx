import { ProjectDetail } from "@/components/dashboard/project-detail"

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProjectDetail id={(await params).id} />
}
