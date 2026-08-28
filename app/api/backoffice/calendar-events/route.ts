import type { NextRequest } from "next/server"

import { proxyMutation, proxyRead } from "@/lib/backoffice-proxy"

export async function GET(request: NextRequest) {
  return proxyRead(request, "/api/v1/calendar-events/")
}

export async function POST(request: NextRequest) {
  return proxyMutation(request, "/api/v1/calendar-events/", "POST")
}
