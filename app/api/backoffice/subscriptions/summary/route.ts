import type { NextRequest } from "next/server"
import { proxyRead } from "@/lib/backoffice-proxy"
export async function GET(request: NextRequest) { return proxyRead(request, "/api/v1/subscriptions/summary/") }
