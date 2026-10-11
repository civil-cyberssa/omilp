import "server-only"

import { isIP } from "node:net"
import type { NextRequest } from "next/server"

export function checkoutSecurityHeaders(request: NextRequest) {
  const forwarded = request.headers.get("x-vercel-forwarded-for")
    ?? request.headers.get("x-forwarded-for")
    ?? request.headers.get("x-real-ip")
    ?? ""
  const clientIp = forwarded.split(",")[0]?.trim() ?? ""
  const internalKey = process.env.CHECKOUT_CLIENT_IP_KEY?.trim() ?? ""

  if (!isIP(clientIp) || !internalKey) return null

  return {
    "X-Checkout-Client-IP": clientIp,
    "X-Checkout-Internal-Key": internalKey,
  }
}
