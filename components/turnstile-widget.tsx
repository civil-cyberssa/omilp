"use client"

import Script from "next/script"
import { useCallback, useEffect, useRef } from "react"

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string
  remove: (widgetId: string) => void
  reset: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const TEST_TOKEN = "XXXX.DUMMY.TOKEN.XXXX"

export function TurnstileWidget({ onToken, resetKey }: { onToken: (token: string | null) => void; resetKey: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""
  const testing = process.env.NODE_ENV === "test"

  const renderWidget = useCallback(() => {
    if (!siteKey || !containerRef.current || !window.turnstile || widgetIdRef.current) return
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action: "checkout",
      appearance: "interaction-only",
      size: "flexible",
      theme: "dark",
      callback: (token: string) => onToken(token),
      "expired-callback": () => onToken(null),
      "error-callback": () => onToken(null),
      "timeout-callback": () => onToken(null),
    })
  }, [onToken, siteKey])

  useEffect(() => {
    if (testing) onToken(TEST_TOKEN)
  }, [onToken, testing])

  useEffect(() => {
    if (!resetKey) return
    onToken(testing ? TEST_TOKEN : null)
    if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current)
  }, [onToken, resetKey, testing])

  useEffect(() => () => {
    if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current)
  }, [])

  if (testing) return <p className="text-center text-xs text-white/45">Verificação de segurança concluída.</p>
  if (!siteKey) return <p role="alert" className="rounded-xl border border-pink-400/25 bg-pink-400/[.07] px-4 py-3 text-sm text-pink-200">A verificação de segurança está indisponível.</p>

  return <div className="space-y-2">
    <Script id="cloudflare-turnstile" src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={renderWidget} />
    <div ref={containerRef} className="min-h-16 w-full" aria-label="Verificação de segurança" />
    <p className="text-center text-xs text-white/38">Protegido pelo Cloudflare Turnstile.</p>
  </div>
}
