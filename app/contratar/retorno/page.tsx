import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react"
import Link from "next/link"
import Footer from "@/components/footer"
import Navbar from "@/components/navbar"
export default async function ReturnPage({ searchParams }: { searchParams: Promise<{ resultado?: string }> }) {
  const result = (await searchParams).resultado ?? "sucesso"
  const success = result === "sucesso"
  const Icon = success ? CheckCircle2 : result === "expirado" ? Clock3 : AlertCircle
  return <main className="min-h-screen bg-[linear-gradient(135deg,#020617,#07143D,#17062D)] text-white"><Navbar /><section className="container mx-auto flex min-h-[75vh] max-w-2xl items-center px-6 py-32"><div className="w-full border border-white/12 bg-white/[.03] p-8 text-center md:p-14"><Icon className="mx-auto h-12 w-12 text-[#8EA8FF]" /><h1 className="mt-6 text-4xl font-semibold">{success ? "Pagamento enviado." : result === "expirado" ? "O checkout expirou." : "Pagamento cancelado."}</h1><p className="mx-auto mt-4 max-w-lg leading-7 text-white/55">{success ? "A confirmação acontece via Asaas. Enquanto isso, já podemos receber as informações do projeto." : "Você pode voltar à oferta e iniciar uma nova tentativa quando quiser."}</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">{success ? <Link href="/briefing" className="rounded-full bg-gradient-to-r from-[#155EEF] via-[#4338FF] to-[#D000B8] px-6 py-3 font-semibold">Preencher briefing</Link> : <Link href="/#offers" className="rounded-full border border-white/20 px-6 py-3 font-semibold">Ver ofertas</Link>}<Link href="/area-cliente" className="rounded-full border border-white/20 px-6 py-3 font-semibold">Área do cliente</Link></div></div></section><Footer /></main>
}
