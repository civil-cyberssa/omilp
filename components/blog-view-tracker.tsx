"use client"

import { useEffect } from "react"

type BlogViewTrackerProps = {
  slug: string
}

export function BlogViewTracker({ slug }: BlogViewTrackerProps) {
  useEffect(() => {
    const storageKey = `omi:blog-view:${slug}`
    if (window.sessionStorage.getItem(storageKey)) return

    window.sessionStorage.setItem(storageKey, "1")
    void fetch(`/api/blog/posts/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      keepalive: true,
    })
      .then((response) => {
        if (!response.ok) window.sessionStorage.removeItem(storageKey)
      })
      .catch(() => window.sessionStorage.removeItem(storageKey))
  }, [slug])

  return null
}
