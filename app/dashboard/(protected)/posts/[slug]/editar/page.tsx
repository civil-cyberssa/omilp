"use client"

import { useParams } from "next/navigation"
import useSWR from "swr"

import PostForm from "@/components/dashboard/post-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardPost, dashboardFetcher } from "@/lib/dashboard-api"

export default function EditPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data, error } = useSWR<DashboardPost>(`/api/backoffice/posts/${encodeURIComponent(slug)}`, dashboardFetcher)
  if (error) return <Alert variant="destructive"><AlertDescription>Não foi possível carregar o post.</AlertDescription></Alert>
  if (!data) return <div className="mx-auto max-w-7xl space-y-5"><Skeleton className="h-12 w-2/3" /><Skeleton className="h-[520px] w-full" /></div>
  return <PostForm key={data.id} post={data} />
}
