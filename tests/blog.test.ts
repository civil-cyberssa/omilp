import { beforeEach, describe, expect, it, vi } from "vitest"

import { getBlogPosts, getMostReadBlogPost, sortBlogPostsByNewest, type BlogPost } from "@/lib/blog"

function post(id: string, publishedAt: string, viewCount: number): BlogPost {
  return {
    id,
    title: id,
    slug: id,
    excerpt: "Resumo",
    content: "<p>Conteúdo</p>",
    cover_image_url: "",
    category: null,
    author_name: "Omi",
    reading_time: 3,
    view_count: viewCount,
    published_at: publishedAt,
    seo_title: "",
    seo_description: "",
  }
}

describe("listagem pública do blog", () => {
  beforeEach(() => vi.restoreAllMocks())

  it("carrega todas as páginas disponíveis na API", async () => {
    const first = post("primeiro", "2026-01-01T12:00:00Z", 2)
    const second = post("segundo", "2026-02-01T12:00:00Z", 4)
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(Response.json({ results: [first], next: "http://localhost:8000/api/v1/blog/posts/?page=2&page_size=100" }))
      .mockResolvedValueOnce(Response.json({ results: [second], next: null }))

    await expect(getBlogPosts()).resolves.toEqual([first, second])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("identifica o artigo mais recente e o mais lido", () => {
    const olderPopular = post("popular", "2026-01-01T12:00:00Z", 100)
    const latest = post("recente", "2026-03-01T12:00:00Z", 10)

    expect(sortBlogPostsByNewest([olderPopular, latest])[0]).toBe(latest)
    expect(getMostReadBlogPost([latest, olderPopular])).toBe(olderPopular)
  })
})
