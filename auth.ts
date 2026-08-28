import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

import {
  accessTokenExpiresAt,
  authenticateStaff,
  blacklistBackendToken,
  refreshBackendTokens,
} from "@/lib/backend-auth"
import {
  AUTH_SESSION_COOKIE,
  AUTH_SESSION_MAX_AGE,
  getAuthSecret,
} from "@/lib/auth-config"

const canonicalAuthUrl = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL
if (canonicalAuthUrl) {
  process.env.AUTH_URL = new URL(canonicalAuthUrl).origin
} else if (process.env.NODE_ENV === "production") {
  throw new Error("AUTH_URL é obrigatória em produção")
}

const credentialsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(1024),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: getAuthSecret(),
  pages: { signIn: "/dashboard/login" },
  session: { strategy: "jwt", maxAge: AUTH_SESSION_MAX_AGE },
  cookies: {
    sessionToken: {
      name: AUTH_SESSION_COOKIE,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null
        return authenticateStaff(parsed.data.email, parsed.data.password)
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.backendAccessToken && user.backendRefreshToken) {
        return {
          ...token,
          backendAccessToken: user.backendAccessToken,
          backendRefreshToken: user.backendRefreshToken,
          backendAccessTokenExpiresAt: user.backendAccessTokenExpiresAt,
          error: undefined,
        }
      }

      if (
        token.backendAccessToken &&
        token.backendAccessTokenExpiresAt &&
        Date.now() < token.backendAccessTokenExpiresAt - 30_000
      ) return token

      if (!token.backendRefreshToken) {
        return { ...token, backendAccessToken: undefined, error: "RefreshTokenError" }
      }

      const refreshed = await refreshBackendTokens(token.backendRefreshToken)
      if (!refreshed) {
        return {
          ...token,
          backendAccessToken: undefined,
          backendRefreshToken: undefined,
          error: "RefreshTokenError",
        }
      }

      return {
        ...token,
        backendAccessToken: refreshed.access,
        backendRefreshToken: refreshed.refresh ?? token.backendRefreshToken,
        backendAccessTokenExpiresAt: accessTokenExpiresAt(refreshed.access),
        error: undefined,
      }
    },
    session({ session, token }) {
      session.error = token.error
      return session
    },
  },
  events: {
    async signOut(message) {
      if ("token" in message) await blacklistBackendToken(message.token?.backendRefreshToken)
    },
  },
})
