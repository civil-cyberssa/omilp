import type { NextRequest } from "next/server"

import { proxyMutation } from "@/lib/backoffice-proxy"

type Context = { params: Promise<{ id: string }> }

export async function DELETE(request: NextRequest, { params }: Context) {
  const { id } = await params
  return proxyMutation(request, `/api/v1/documents/${encodeURIComponent(id)}/`, "DELETE")
}
