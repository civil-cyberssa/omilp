import { PortalExchange } from "@/components/portal-exchange"
export default async function AccessPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) { const token = (await searchParams).token ?? ""; return <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#020617,#07143D,#17062D)] px-6 text-white"><PortalExchange token={token} /></main> }
