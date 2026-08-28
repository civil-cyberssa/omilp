import type { NextRequest } from "next/server"

import { proxyRead } from "@/lib/backoffice-proxy"

type Context = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Context) {
  const { id } = await params
  return proxyRead(request, `/api/v1/documents/${encodeURIComponent(id)}/download/`)
}
