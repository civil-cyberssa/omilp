import { PortalSiteDetail } from "@/components/portal/portal-site-detail"

export default async function SitePage({ params }: { params: Promise<{ id: string }> }) {
  return <PortalSiteDetail id={(await params).id} />
}
