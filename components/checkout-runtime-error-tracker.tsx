"use client"

import { useEffect } from "react"

import { trackCheckoutError } from "@/lib/checkout-error-analytics"

export function CheckoutRuntimeErrorTracker() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      void trackCheckoutError({
        errorType: "runtime_error",
        errorCode: event.error?.name || "JAVASCRIPT_ERROR",
        message: event.message || "Erro de JavaScript sem mensagem",
        endpoint: event.filename || window.location.pathname,
        inputs: { line: event.lineno, column: event.colno },
      })
    }
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      void trackCheckoutError({
        errorType: "runtime_error",
        errorCode: reason instanceof Error ? reason.name : "UNHANDLED_REJECTION",
        message: reason instanceof Error ? reason.message : String(reason ?? "Promise rejeitada sem motivo"),
        endpoint: window.location.pathname,
      })
    }

    window.addEventListener("error", onError)
    window.addEventListener("unhandledrejection", onUnhandledRejection)
    return () => {
      window.removeEventListener("error", onError)
      window.removeEventListener("unhandledrejection", onUnhandledRejection)
    }
  }, [])

  return null
}
