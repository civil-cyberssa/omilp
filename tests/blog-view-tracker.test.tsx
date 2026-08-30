import { cleanup, render, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { BlogViewTracker } from "@/components/blog-view-tracker"

describe("contador de acessos do blog", () => {
  beforeEach(() => window.sessionStorage.clear())

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it("registra apenas um acesso ao mesmo post durante a sessão", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ view_count: 1 }),
    )

    const firstRender = render(<BlogViewTracker slug="post-de-teste" />)
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    firstRender.unmount()
    render(<BlogViewTracker slug="post-de-teste" />)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/blog/posts/post-de-teste/view",
      expect.objectContaining({ method: "POST", keepalive: true }),
    )
  })

  it("permite tentar novamente quando o registro falha", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 503 }),
    )

    render(<BlogViewTracker slug="post-indisponivel" />)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(window.sessionStorage.getItem("omi:blog-view:post-indisponivel")).toBeNull()
    })
  })
})
