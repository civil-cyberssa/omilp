import { buildSecurityHeaders } from './lib/security-headers.mjs'

let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch {
  // ignore error
}

const mediaUrl = new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1')
const production = process.env.NODE_ENV === 'production'
const securityHeaders = buildSecurityHeaders(mediaUrl, production)

/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  poweredByHeader: false,
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  images: {
    unoptimized: true,
    remotePatterns: [{
      protocol: mediaUrl.protocol.replace(':', ''),
      hostname: mediaUrl.hostname,
      port: mediaUrl.port,
      pathname: '/media/**',
    }],
  },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
