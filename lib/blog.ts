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
  published_at: string
  seo_title: string
  seo_description: string
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(`${apiUrl}/blog/posts/`, { cache: "no-store" })
    if (!response.ok) return []
    const data: BlogPost[] | { results: BlogPost[] } = await response.json()
    return Array.isArray(data) ? data : data.results
  } catch {
    return []
  }
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
