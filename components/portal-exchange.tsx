"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { apiErrorMessage } from "@/lib/portal"

type ExchangeResult =
  | { authenticated: true }
  | { authenticated: false; message: string }

const pendingExchanges = new Map<string, Promise<ExchangeResult>>()

function exchangePortalToken(token: string) {
  const pending = pendingExchanges.get(token)
  if (pending) return pending

  const exchange = fetch("/api/portal/access/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
    .then(async (response): Promise<ExchangeResult> => {
      if (response.ok) return { authenticated: true }

      const data = await response.json().catch(() => ({}))
      return {
        authenticated: false,
        message: apiErrorMessage(data, "Este link não é mais válido."),
      }
    })
    .catch((): ExchangeResult => ({
      authenticated: false,
      message: "Não foi possível validar o acesso agora.",
    }))

  pendingExchanges.set(token, exchange)
  void exchange.finally(() => pendingExchanges.delete(token))
  return exchange
}

export function PortalExchange({ token }: { token: string }) {
  const router = useRouter()
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    void exchangePortalToken(token).then((result) => {
      if (!active) return
      if (!result.authenticated) {
        setError(result.message)
        return
      }
      router.replace("/area-cliente")
      router.refresh()
    })

    return () => {
      active = false
    }
  }, [router, token])

  return (
    <div className="text-center">
      {error ? (
        <>
          <h1 className="text-3xl font-semibold">Link inválido ou expirado.</h1>
          <p className="mt-3 text-white/55">{error}</p>
          <a
            href="/area-cliente/entrar"
            className="mt-7 inline-block rounded-full border border-white/20 px-6 py-3"
          >
            Solicitar outro link
          </a>
        </>
      ) : (
        <>
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-[#8EA8FF]" />
          <p className="mt-4 text-white/55">Validando seu acesso…</p>
        </>
      )}
    </div>
  )
}
