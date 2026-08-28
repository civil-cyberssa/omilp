import "server-only"

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { backendEndpoint } from "@/lib/server-auth"
import { proxyUpstreamResponse } from "@/lib/api-response"

export const PORTAL_COOKIE = "omi_portal"
export const PURCHASE_COOKIE = "omi_purchase"

const secure = process.env.NODE_ENV === "production"
const baseOptions = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" }

export function setPortalCookie(response: NextResponse, token: string) {
  response.cookies.set(PORTAL_COOKIE, token, { ...baseOptions, maxAge: 7 * 24 * 60 * 60 })
}

export function clearPortalCookie(response: NextResponse) {
  response.cookies.set(PORTAL_COOKIE, "", { ...baseOptions, maxAge: 0 })
}

export function setPurchaseCookie(response: NextResponse, token: string) {
  response.cookies.set(PURCHASE_COOKIE, token, { ...baseOptions, maxAge: 2 * 60 * 60 })
}

export async function portalBackendRequest(
  request: NextRequest,
  path: string,
  init: RequestInit = {},
) {
  const token = request.cookies.get(PORTAL_COOKIE)?.value
  const headers = new Headers(init.headers)
  if (token) headers.set("X-Portal-Token", token)
  return fetch(backendEndpoint(path), { ...init, headers, cache: "no-store" })
}

export async function passThrough(response: Response) {
  return proxyUpstreamResponse(response)
}
