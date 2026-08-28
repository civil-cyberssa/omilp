"use client"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
export function PortalExchange({ token }: { token: string }) {
  const router = useRouter(); const [error, setError] = useState("")
  useEffect(() => { let active = true; fetch("/api/portal/access/exchange", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then(async (response) => { if (!active) return; if (!response.ok) { const data = await response.json().catch(() => ({})); setError(data.detail ?? "Este link não é mais válido."); return } router.replace("/area-cliente"); router.refresh() }).catch(() => { if (active) setError("Não foi possível validar o acesso agora.") }); return () => { active = false } }, [router, token])
  return <div className="text-center">{error ? <><h1 className="text-3xl font-semibold">Link inválido ou expirado.</h1><p className="mt-3 text-white/55">{error}</p><a href="/area-cliente/entrar" className="mt-7 inline-block rounded-full border border-white/20 px-6 py-3">Solicitar outro link</a></> : <><Loader2 className="mx-auto h-9 w-9 animate-spin text-[#8EA8FF]" /><p className="mt-4 text-white/55">Validando seu acesso…</p></>}</div>
}
