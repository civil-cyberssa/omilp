export function buildContentSecurityPolicy(apiUrl, production, nonce) {
  const mediaUrl = new URL(apiUrl)
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${production ? '' : " 'unsafe-eval'"} https://www.googletagmanager.com https://connect.facebook.net`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${mediaUrl.origin} https://www.google-analytics.com https://www.googletagmanager.com https://www.facebook.com`,
    "font-src 'self' data:",
    `connect-src 'self' ${mediaUrl.origin} https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://www.facebook.com`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-src https:",
    "frame-ancestors 'none'",
    ...(production ? ["upgrade-insecure-requests"] : []),
  ].join("; ")
}

export function buildSecurityHeaders(apiUrl, production) {
  // The request-specific CSP is emitted by proxy.ts because script nonces must
  // be fresh for every rendered document.
  new URL(apiUrl)
  return [
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    ...(production
      ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }]
      : []),
  ]
}
