import type { NextRequest } from "next/server"

import { proxyMutation, proxyRead } from "@/lib/backoffice-proxy"

export async function GET(request: NextRequest) {
  return proxyRead(request, "/api/v1/change-requests/")
}

export async function POST(request: NextRequest) {
  return proxyMutation(request, "/api/v1/change-requests/", "POST")
}
