export type BlogCategory = {
  id: string
  name: string
  slug: string
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string
  category: BlogCategory | null
  author_name: string
  reading_time: number
  view_count: number
  published_at: string
  seo_title: string
  seo_description: string
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export async function getBlogPosts(): Promise<BlogPost[]> {
  const firstPage = new URL(`${apiUrl}/blog/posts/`)
  firstPage.searchParams.set("page_size", "100")
  const posts = new Map<string, BlogPost>()
  const visitedPages = new Set<string>()
  let nextPage: string | null = firstPage.toString()

  try {
    while (nextPage) {
      const pageUrl: URL = new URL(nextPage, firstPage)
      if (
        pageUrl.origin !== firstPage.origin
        || !pageUrl.pathname.startsWith(firstPage.pathname)
        || visitedPages.has(pageUrl.toString())
      ) break

      visitedPages.add(pageUrl.toString())
      const response: Response = await fetch(pageUrl, { cache: "no-store" })
      if (!response.ok) break
      const data: BlogPost[] | { results: BlogPost[]; next?: string | null } = await response.json()
      const pagePosts = Array.isArray(data) ? data : data.results
      pagePosts.forEach((post) => posts.set(post.id, post))
      nextPage = Array.isArray(data) ? null : (data.next ?? null)
    }

    return [...posts.values()]
  } catch {
    return [...posts.values()]
  }
}

function publishedTime(post: Pick<BlogPost, "published_at">) {
  const timestamp = new Date(post.published_at).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

export function sortBlogPostsByNewest(posts: BlogPost[]) {
  return [...posts].sort((left, right) => publishedTime(right) - publishedTime(left))
}

export function getMostReadBlogPost(posts: BlogPost[]) {
  return [...posts].sort(
    (left, right) => right.view_count - left.view_count || publishedTime(right) - publishedTime(left),
  )[0] ?? null
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`${apiUrl}/blog/posts/${encodeURIComponent(slug)}/`, {
      cache: "no-store",
    })
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export function formatPostDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Bahia",
  }).format(new Date(value))
}
