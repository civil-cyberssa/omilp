import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    backendAccessToken?: string
    backendRefreshToken?: string
    backendAccessTokenExpiresAt?: number
  }

  interface Session {
    user: DefaultSession["user"]
    error?: "RefreshTokenError"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendAccessToken?: string
    backendRefreshToken?: string
    backendAccessTokenExpiresAt?: number
    error?: "RefreshTokenError"
  }
}
