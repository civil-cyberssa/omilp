import type { NextRequest } from "next/server"
import { proxyMutation, proxyRead } from "@/lib/backoffice-proxy"
type Context = { params: Promise<{ id: string }> }
const path = (id: string) => `/api/v1/orders/${encodeURIComponent(id)}/`
export async function GET(request: NextRequest, { params }: Context) { return proxyRead(request, path((await params).id)) }
export async function PATCH(request: NextRequest, { params }: Context) { return proxyMutation(request, path((await params).id), "PATCH") }
