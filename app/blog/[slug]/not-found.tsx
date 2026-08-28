import Link from "next/link"

export default function BlogPostNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_15%_15%,rgba(21,94,239,.25),transparent_30%),radial-gradient(circle_at_85%_85%,rgba(208,0,184,.2),transparent_30%),linear-gradient(135deg,#020617,#07143D_55%,#17062D)] px-6 text-center text-white">
      <div>
        <p className="bg-gradient-to-r from-[#155EEF] via-[#7C2AE8] to-[#D000B8] bg-clip-text text-xs font-semibold uppercase tracking-[0.3em] text-transparent">404 · Caderno Omi</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em]">Este documento não está disponível.</h1>
        <Link href="/blog" className="mt-8 inline-flex border-b border-[#7C2AE8] pb-1 text-sm text-white/70 transition hover:text-white">
          Voltar para todos os artigos
        </Link>
      </div>
    </main>
  )
}
