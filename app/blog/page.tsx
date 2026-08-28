import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, BookOpen, Clock3 } from "lucide-react"

import Footer from "@/components/footer"
import Navbar from "@/components/navbar"
import { formatPostDate, getBlogPosts } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Blog",
  description: "Ideias, decisões e aprendizados da Omi sobre tecnologia, produto digital e crescimento.",
  alternates: { canonical: "/blog" },
}

export default async function BlogPage() {
  const posts = await getBlogPosts()
  const [featured, ...remaining] = posts

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-[#F8FAFC]">
      <Navbar />
      <section className="relative border-b border-white/10 px-6 pb-20 pt-36 md:pb-28 md:pt-44">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(21,94,239,.24),transparent_29%),radial-gradient(circle_at_82%_76%,rgba(208,0,184,.18),transparent_28%),linear-gradient(135deg,#020617_0%,#07143D_55%,#17062D_100%)]" />
        <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="container relative mx-auto max-w-6xl">
          <div className="grid items-end gap-12 lg:grid-cols-[1fr_22rem]">
            <div>
              <div className="mb-7 flex items-center gap-3 bg-gradient-to-r from-[#155EEF] via-[#7C2AE8] to-[#D000B8] bg-clip-text text-xs font-semibold uppercase tracking-[0.3em] text-transparent">
                <span className="h-px w-10 bg-gradient-to-r from-[#155EEF] to-[#D000B8]" /> Caderno Omi
              </div>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.055em] md:text-7xl lg:text-[6.4rem]">
                Tecnologia sem o ruído.
              </h1>
            </div>
            <p className="border-l border-[#7C2AE8]/60 pl-6 text-base leading-7 text-white/58">
              Notas de campo sobre produtos digitais, engenharia e as escolhas que fazem uma empresa avançar.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-6 py-16 md:py-24">
        {featured ? (
          <>
            <Link
              href={`/blog/${featured.slug}`}
              className="group grid overflow-hidden border-y border-white/12 py-8 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:py-12"
            >
              <div className="relative mb-9 aspect-[16/10] overflow-hidden bg-[#07143D] md:mb-0">
                {featured.cover_image_url ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-[1.03]"
                    style={{ backgroundImage: `url(${JSON.stringify(featured.cover_image_url).slice(1, -1)})` }}
                    role="img"
                    aria-label=""
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(21,94,239,.24),rgba(124,42,232,.12)_48%,rgba(208,0,184,.18)),repeating-linear-gradient(90deg,transparent_0,transparent_39px,rgba(255,255,255,.07)_40px)]">
                    <span className="absolute bottom-7 left-7 font-mono text-7xl font-bold text-white/10">01</span>
                  </div>
                )}
                <span className="absolute left-5 top-5 bg-gradient-to-r from-[#155EEF] via-[#7C2AE8] to-[#D000B8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_28px_rgba(67,56,255,.3)]">
                  Em destaque
                </span>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8EA8FF]">
                  {featured.category?.name ?? "Perspectivas"}
                </p>
                <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.035em] transition group-hover:text-[#AFA8FF] md:text-5xl">
                  {featured.title}
                </h2>
                <p className="mt-6 max-w-xl text-base leading-7 text-white/55">{featured.excerpt}</p>
                <div className="mt-9 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/45">
                  <span>{formatPostDate(featured.published_at)}</span>
                  <span className="flex items-center gap-2">
                    <Clock3 className="h-3.5 w-3.5" /> {featured.reading_time} min
                    <ArrowUpRight className="ml-3 h-4 w-4 text-[#D000B8] transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </span>
                </div>
              </div>
            </Link>

            {remaining.length > 0 ? (
              <div className="mt-16 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
                {remaining.map((post, index) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group border-t border-white/15 pt-5">
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
                      <span>{post.category?.name ?? "Omi"}</span>
                      <span>{String(index + 2).padStart(2, "0")}</span>
                    </div>
                    <h2 className="mt-7 text-2xl font-semibold leading-tight tracking-[-0.025em] transition group-hover:text-[#AFA8FF]">
                      {post.title}
                    </h2>
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/52">{post.excerpt}</p>
                    <div className="mt-7 flex items-center justify-between text-xs text-white/38">
                      <span>{formatPostDate(post.published_at)}</span>
                      <ArrowUpRight className="h-4 w-4 text-[#D000B8] transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="mx-auto max-w-2xl border border-white/12 bg-white/[0.025] px-8 py-16 text-center md:px-14">
            <BookOpen className="mx-auto h-8 w-8 text-[#7C2AE8]" />
            <p className="mt-7 bg-gradient-to-r from-[#155EEF] via-[#7C2AE8] to-[#D000B8] bg-clip-text text-xs font-semibold uppercase tracking-[0.26em] text-transparent">Primeira edição em preparo</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">As boas ideias estão ganhando forma.</h2>
            <p className="mx-auto mt-5 max-w-md leading-7 text-white/52">
              Em breve, este espaço reunirá os documentos, aprendizados e perspectivas publicados pela Omi.
            </p>
          </div>
        )}
      </section>
      <Footer />
    </main>
  )
}
