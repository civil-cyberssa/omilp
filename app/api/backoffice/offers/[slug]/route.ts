import type { NextRequest } from "next/server"
import { proxyMutation, proxyRead } from "@/lib/backoffice-proxy"
type Context = { params: Promise<{ slug: string }> }
const path = (slug: string) => `/api/v1/offers/${encodeURIComponent(slug)}/`
export async function GET(request: NextRequest, { params }: Context) { return proxyRead(request, path((await params).slug)) }
export async function PATCH(request: NextRequest, { params }: Context) { return proxyMutation(request, path((await params).slug), "PATCH") }
export async function DELETE(request: NextRequest, { params }: Context) { return proxyMutation(request, path((await params).slug), "DELETE") }
