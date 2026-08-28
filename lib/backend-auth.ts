export type BackendTokenPair = { access: string; refresh?: string }

export type StaffUser = {
  id: string
  email: string
  name: string
  backendAccessToken: string
  backendRefreshToken: string
  backendAccessTokenExpiresAt: number
}

const backendUrl = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000"
).replace(/\/api\/v1\/?$/, "")

const refreshes = new Map<string, Promise<BackendTokenPair | null>>()

export function backendEndpoint(path: string) {
  return `${backendUrl}${path.startsWith("/") ? path : `/${path}`}`
}

export function accessTokenExpiresAt(accessToken: string) {
  try {
    const payload = accessToken.split(".")[1]
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const parsed = JSON.parse(atob(normalized)) as { exp?: unknown }
    if (typeof parsed.exp === "number") return parsed.exp * 1000
  } catch {
    // The backend is the authority for the token. A conservative fallback only
    // controls when Auth.js attempts to refresh it.
  }
  return Date.now() + 25 * 60 * 1000
}

export async function authenticateStaff(email: string, password: string): Promise<StaffUser | null> {
  const tokenResponse = await fetch(backendEndpoint("/api/auth/token/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  })
  if (!tokenResponse.ok) return null

  const tokens = (await tokenResponse.json()) as BackendTokenPair
  if (!tokens.access || !tokens.refresh) return null

  const meResponse = await fetch(backendEndpoint("/api/auth/me/"), {
    headers: { Authorization: `Bearer ${tokens.access}` },
    cache: "no-store",
  })
  if (!meResponse.ok) return null

  const user = (await meResponse.json()) as {
    id: string
    email: string
    full_name?: string
  }
  if (!user.id || !user.email) return null

  return {
    id: user.id,
    email: user.email,
    name: user.full_name || user.email,
    backendAccessToken: tokens.access,
    backendRefreshToken: tokens.refresh,
    backendAccessTokenExpiresAt: accessTokenExpiresAt(tokens.access),
  }
}

async function requestTokenRefresh(refreshToken: string): Promise<BackendTokenPair | null> {
  const response = await fetch(backendEndpoint("/api/auth/token/refresh/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
    cache: "no-store",
  })
  if (!response.ok) return null
  const tokens = (await response.json()) as BackendTokenPair
  return tokens.access ? tokens : null
}

export function refreshBackendTokens(refreshToken: string) {
  const pending = refreshes.get(refreshToken)
  if (pending) return pending

  const refresh = requestTokenRefresh(refreshToken).finally(() => {
    refreshes.delete(refreshToken)
  })
  refreshes.set(refreshToken, refresh)
  return refresh
}

export async function blacklistBackendToken(refreshToken?: string) {
  if (!refreshToken) return
  await fetch(backendEndpoint("/api/auth/token/blacklist/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
    cache: "no-store",
  }).catch(() => undefined)
}
