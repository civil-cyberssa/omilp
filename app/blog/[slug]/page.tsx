import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Clock3 } from "lucide-react"
import { notFound } from "next/navigation"

import Footer from "@/components/footer"
import Navbar from "@/components/navbar"
import { formatPostDate, getBlogPost } from "@/lib/blog"

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) return { title: "Artigo não encontrado" }
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      publishedTime: post.published_at,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) notFound()

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#FFFFFF_0%,#F5F7FF_58%,#EEE9FF_100%)] text-[#020617]">
      <div className="bg-[#020617] text-white"><Navbar /></div>
      <article>
        <header className="relative overflow-hidden bg-[#020617] px-6 pb-20 pt-36 text-white md:pb-28 md:pt-44">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(21,94,239,.24),transparent_30%),radial-gradient(circle_at_82%_76%,rgba(208,0,184,.18),transparent_29%),linear-gradient(135deg,#020617_0%,#07143D_58%,#17062D_100%)]" />
          <div className="relative mx-auto max-w-4xl">
            <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/48 transition hover:text-[#8EA8FF]">
              <ArrowLeft className="h-4 w-4" /> Voltar ao caderno
            </Link>
            <p className="mt-14 bg-gradient-to-r from-[#155EEF] via-[#7C2AE8] to-[#D000B8] bg-clip-text text-xs font-semibold uppercase tracking-[0.25em] text-transparent">
              {post.category?.name ?? "Caderno Omi"}
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.03] tracking-[-0.045em] md:text-7xl">{post.title}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/58">{post.excerpt}</p>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/12 pt-5 text-xs text-white/42">
              <span>{post.author_name}</span>
              <span>{formatPostDate(post.published_at)}</span>
              <span className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5" /> {post.reading_time} min de leitura</span>
            </div>
          </div>
        </header>

        {post.cover_image_url ? (
          <div className="mx-auto -mt-10 max-w-6xl px-6 md:-mt-14">
            <div className="relative aspect-[16/8] overflow-hidden border border-black/10 bg-black/5 shadow-[0_24px_70px_rgba(0,0,0,.16)]">
              <Image src={post.cover_image_url} alt={`Capa do artigo ${post.title}`} fill priority sizes="(max-width: 768px) 100vw, 1152px" className="object-cover" />
            </div>
          </div>
        ) : null}

        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[12rem_minmax(0,46rem)] md:py-24">
          <aside className="hidden md:block">
            <div className="sticky top-28 border-t border-black/25 pt-4 text-[10px] font-bold uppercase tracking-[0.24em] text-black/40">
              Documento Omi<br />Conhecimento aplicado
            </div>
          </aside>
          <div className="prose prose-lg prose-slate max-w-none prose-headings:text-[#020617] prose-headings:tracking-[-0.025em] prose-a:text-[#155EEF] prose-a:decoration-[#D000B8] prose-strong:text-[#020617] prose-blockquote:border-[#7C2AE8] prose-blockquote:text-[#07143D]/70" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </article>
      <Footer />
    </main>
  )
}
