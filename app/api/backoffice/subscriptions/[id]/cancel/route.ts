import type { NextRequest } from "next/server"
import { proxyMutation } from "@/lib/backoffice-proxy"
type Context = { params: Promise<{ id: string }> }
export async function POST(request: NextRequest, { params }: Context) { return proxyMutation(request, `/api/v1/subscriptions/${encodeURIComponent((await params).id)}/cancel/`, "POST") }
