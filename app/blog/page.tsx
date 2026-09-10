import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, BookOpen, Clock3, Eye, Sparkles, TrendingUp } from "lucide-react"

import Footer from "@/components/footer"
import Navbar from "@/components/navbar"
import {
  formatPostDate,
  getBlogPosts,
  getMostReadBlogPost,
  sortBlogPostsByNewest,
  type BlogPost,
} from "@/lib/blog"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Blog",
  description: "Ideias, decisões e aprendizados da Omi sobre tecnologia, produto digital e crescimento.",
  alternates: { canonical: "/blog" },
}

type BlogPageProps = {
  searchParams: Promise<{ categoria?: string | string[] }>
}

function PostVisual({ post, priority = false }: { post: BlogPost; priority?: boolean }) {
  if (post.cover_image_url) {
    return (
      <Image
        src={post.cover_image_url}
        alt={`Capa do artigo ${post.title}`}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 720px"
        className="object-cover transition duration-700 group-hover:scale-[1.035]"
      />
    )
  }

  return (
    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(21,94,239,.32),rgba(124,42,232,.14)_48%,rgba(208,0,184,.24)),repeating-linear-gradient(90deg,transparent_0,transparent_47px,rgba(255,255,255,.06)_48px)]">
      <Sparkles className="absolute bottom-7 right-7 h-12 w-12 text-white/12" aria-hidden="true" />
    </div>
  )
}

function LatestPost({ post, alsoMostRead }: { post: BlogPost; alsoMostRead: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative grid min-h-[520px] overflow-hidden border border-white/12 bg-[#07143D] md:grid-cols-[1.1fr_.9fr]"
    >
      <div className="relative min-h-72 overflow-hidden md:min-h-full">
        <PostVisual post={post} priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/75 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#050b21]/45" />
      </div>
      <div className="relative flex flex-col justify-between bg-[linear-gradient(145deg,rgba(7,20,61,.98),rgba(23,6,45,.96))] p-7 md:p-10">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#07143D]">Mais recente</span>
            {alsoMostRead ? <span className="border border-[#D000B8]/40 bg-[#D000B8]/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#F5B8EC]">Mais lido</span> : null}
          </div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[.24em] text-[#8EA8FF]">{post.category?.name ?? "Caderno Omi"}</p>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.06] tracking-[-.04em] transition group-hover:text-[#B9B4FF] md:text-5xl">{post.title}</h2>
          <p className="mt-5 line-clamp-3 text-sm leading-7 text-white/55">{post.excerpt}</p>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs text-white/42">
          <span>{formatPostDate(post.published_at)}</span>
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{post.reading_time} min</span>
            <ArrowUpRight className="h-4 w-4 text-[#D000B8] transition group-hover:translate-x-1 group-hover:-translate-y-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function MostReadPost({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex h-full min-h-[520px] flex-col border border-white/12 bg-white/[.035] p-6 transition hover:border-[#7C2AE8]/55 hover:bg-white/[.055] md:p-8">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#E3B1DA]"><TrendingUp className="h-4 w-4 text-[#D000B8]" />Mais lido</span>
        <span className="flex items-center gap-1.5 text-xs text-white/42"><Eye className="h-3.5 w-3.5" />{post.view_count.toLocaleString("pt-BR")}</span>
      </div>
      <div className="relative mt-7 aspect-[16/10] overflow-hidden bg-[#07143D]">
        <PostVisual post={post} />
      </div>
      <p className="mt-7 text-[10px] font-semibold uppercase tracking-[.22em] text-[#8EA8FF]">{post.category?.name ?? "Caderno Omi"}</p>
      <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-.03em] transition group-hover:text-[#B9B4FF]">{post.title}</h2>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-white/50">{post.excerpt}</p>
      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/38">
        <span>{post.reading_time} min de leitura</span>
        <ArrowUpRight className="h-4 w-4 text-[#D000B8] transition group-hover:translate-x-1 group-hover:-translate-y-1" />
      </div>
    </Link>
  )
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const allPosts = sortBlogPostsByNewest(await getBlogPosts())
  const categories = Array.from(
    new Map(allPosts.flatMap((post) => post.category ? [[post.category.slug, post.category]] : [])).values(),
  ).sort((left, right) => left.name.localeCompare(right.name, "pt-BR"))
  const requestedCategory = (await searchParams).categoria
  const categorySlug = Array.isArray(requestedCategory) ? requestedCategory[0] : requestedCategory
  const activeCategory = categories.some((category) => category.slug === categorySlug) ? categorySlug : undefined
  const posts = activeCategory ? allPosts.filter((post) => post.category?.slug === activeCategory) : allPosts
  const latestPost = posts[0] ?? null
  const mostReadPost = getMostReadBlogPost(posts)
  const activeCategoryName = categories.find((category) => category.slug === activeCategory)?.name

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-[#F8FAFC]">
      <Navbar />
      <section className="relative border-b border-white/10 px-6 pb-16 pt-36 md:pb-24 md:pt-44">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(21,94,239,.24),transparent_29%),radial-gradient(circle_at_82%_76%,rgba(208,0,184,.18),transparent_28%),linear-gradient(135deg,#020617_0%,#07143D_55%,#17062D_100%)]" />
        <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="container relative mx-auto max-w-6xl">
          <div className="grid items-end gap-12 lg:grid-cols-[1fr_22rem]">
            <div>
              <div className="mb-7 flex items-center gap-3 bg-gradient-to-r from-[#155EEF] via-[#7C2AE8] to-[#D000B8] bg-clip-text text-xs font-semibold uppercase tracking-[0.3em] text-transparent">
                <span className="h-px w-10 bg-gradient-to-r from-[#155EEF] to-[#D000B8]" /> Caderno Omi
              </div>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.055em] md:text-7xl lg:text-[6.4rem]">Tecnologia sem o ruído.</h1>
            </div>
            <p className="border-l border-[#7C2AE8]/60 pl-6 text-base leading-7 text-white/58">Notas de campo sobre produtos digitais, engenharia e as escolhas que fazem uma empresa avançar.</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-6 pt-10 md:pt-14" aria-label="Filtrar artigos por categoria">
        <div className="flex items-center gap-3 overflow-x-auto border-b border-white/10 pb-5 [scrollbar-width:none]">
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[.22em] text-white/35">Explorar</span>
          <Link href="/blog" aria-current={!activeCategory ? "page" : undefined} className={cn("shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition", !activeCategory ? "border-white bg-white text-[#07143D]" : "border-white/12 text-white/58 hover:border-white/30 hover:text-white")}>Todos <span className="ml-1 opacity-55">{allPosts.length}</span></Link>
          {categories.map((category) => {
            const selected = activeCategory === category.slug
            const count = allPosts.filter((post) => post.category?.slug === category.slug).length
            return <Link key={category.id} href={{ pathname: "/blog", query: { categoria: category.slug } }} aria-current={selected ? "page" : undefined} className={cn("shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition", selected ? "border-white bg-white text-[#07143D]" : "border-white/12 text-white/58 hover:border-white/30 hover:text-white")}>{category.name} <span className="ml-1 opacity-55">{count}</span></Link>
          })}
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-6 py-14 md:py-20">
        {latestPost && mostReadPost ? (
          <>
            <div className="mb-7 flex items-end justify-between gap-6">
              <div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#8EA8FF]">Seleção editorial</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em] md:text-3xl">Para começar a leitura.</h2></div>
              {activeCategoryName ? <p className="hidden text-sm text-white/42 sm:block">Destaques em {activeCategoryName}</p> : null}
            </div>
            <div className="grid gap-5 lg:grid-cols-[1.65fr_.85fr]">
              <LatestPost post={latestPost} alsoMostRead={latestPost.id === mostReadPost.id} />
              <MostReadPost post={mostReadPost} />
            </div>

            <div className="mb-8 mt-20 flex items-end justify-between gap-5 border-b border-white/12 pb-5">
              <div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#8EA8FF]">Arquivo completo</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.035em]">{activeCategoryName ?? "Todos os artigos"}</h2></div>
              <p className="text-xs text-white/38">{posts.length} {posts.length === 1 ? "artigo" : "artigos"}</p>
            </div>
            <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col border-t border-white/15 pt-5">
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#07143D]"><PostVisual post={post} /></div>
                  <div className="mt-5 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[.2em] text-white/38"><span>{post.category?.name ?? "Caderno Omi"}</span><span className="flex items-center gap-1.5"><Eye className="h-3 w-3" />{post.view_count.toLocaleString("pt-BR")}</span></div>
                  <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-[-.025em] transition group-hover:text-[#B9B4FF]">{post.title}</h3>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/50">{post.excerpt}</p>
                  <div className="mt-auto flex items-center justify-between border-b border-white/8 py-6 text-xs text-white/36"><span>{formatPostDate(post.published_at)}</span><span className="flex items-center gap-2">{post.reading_time} min <ArrowUpRight className="h-4 w-4 text-[#D000B8] transition group-hover:translate-x-1 group-hover:-translate-y-1" /></span></div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-2xl border border-white/12 bg-white/[0.025] px-8 py-16 text-center md:px-14">
            <BookOpen className="mx-auto h-8 w-8 text-[#7C2AE8]" />
            <p className="mt-7 bg-gradient-to-r from-[#155EEF] via-[#7C2AE8] to-[#D000B8] bg-clip-text text-xs font-semibold uppercase tracking-[0.26em] text-transparent">Primeira edição em preparo</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">As boas ideias estão ganhando forma.</h2>
            <p className="mx-auto mt-5 max-w-md leading-7 text-white/52">Em breve, este espaço reunirá os documentos, aprendizados e perspectivas publicados pela Omi.</p>
          </div>
        )}
      </section>
      <Footer />
    </main>
  )
}
