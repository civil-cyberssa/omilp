"use client"
import useSWR from "swr"
import { OfferForm } from "@/components/dashboard/offer-form"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardOffer, dashboardFetcher } from "@/lib/dashboard-api"
import { use } from "react"
export default function EditOfferPage({params}:{params:Promise<{slug:string}>}){const {slug}=use(params);const {data,error,mutate}=useSWR<DashboardOffer>(`/api/backoffice/offers/${slug}`,dashboardFetcher);if(error)return <p className="text-destructive">Oferta não encontrada.</p>;if(!data)return <Skeleton className="mx-auto h-[600px] max-w-4xl"/>;return <div className="mx-auto max-w-4xl space-y-7"><div><p className="text-sm font-medium text-[#155EEF]">Catálogo</p><h1 className="mt-1 text-3xl font-semibold">Editar oferta</h1></div><OfferForm offer={data} onSaved={async (saved) => { await mutate(saved, { revalidate: false }) }}/></div>}
