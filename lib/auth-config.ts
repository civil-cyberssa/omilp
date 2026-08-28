export const AUTH_SESSION_MAX_AGE = 7 * 24 * 60 * 60

export function getAuthSecret() {
  return (
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    // Compatibilidade com a variável usada antes da migração para Auth.js.
    process.env.BETTER_AUTH_SECRET
  )
}

export const AUTH_SESSION_COOKIE = process.env.NODE_ENV === "production"
  ? "__Host-omi.admin-session"
  : "omi.admin-session"

export const PORTAL_COOKIE = process.env.NODE_ENV === "production"
  ? "__Host-omi.portal-session"
  : "omi_portal"

export const PURCHASE_COOKIE = process.env.NODE_ENV === "production"
  ? "__Host-omi.purchase-session"
  : "omi_purchase"
