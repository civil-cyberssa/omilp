import type { NextRequest } from "next/server"

import { proxyMutation } from "@/lib/backoffice-proxy"

type Context = { params: Promise<{ id: string }> }
const path = (id: string) => `/api/v1/calendar-events/${encodeURIComponent(id)}/`

export async function PATCH(request: NextRequest, { params }: Context) {
  return proxyMutation(request, path((await params).id), "PATCH")
}

export async function DELETE(request: NextRequest, { params }: Context) {
  return proxyMutation(request, path((await params).id), "DELETE")
}
