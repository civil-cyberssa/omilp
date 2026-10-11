import type { NextRequest } from "next/server"

import { proxyMutation } from "@/lib/backoffice-proxy"

export async function POST(request: NextRequest) {
  return proxyMutation(request, "/api/auth/me/password/", "POST")
}
