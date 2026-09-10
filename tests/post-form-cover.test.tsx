import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}))

vi.mock("swr", () => ({
  default: () => ({ data: [] }),
  useSWRConfig: () => ({ mutate: vi.fn() }),
}))

vi.mock("@/components/dashboard/rich-text-editor", () => ({
  default: () => <div data-testid="rich-text-editor" />,
}))

import PostForm from "@/components/dashboard/post-form"

describe("imagem de capa do PostForm", () => {
  beforeEach(() => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:cover-preview")
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it("aceita uma imagem arrastada para a área de capa", () => {
    render(<PostForm />)
    const image = new File(["capa"], "capa.png", { type: "image/png" })
    const dropzone = screen.getByText("Arraste, cole ou clique para enviar").closest("label")!

    fireEvent.drop(dropzone, { dataTransfer: { files: [image] } })

    expect(screen.getByAltText("Prévia da capa")).toHaveAttribute("src", "blob:cover-preview")
  })

  it("aceita uma imagem colada do clipboard", () => {
    render(<PostForm />)
    const image = new File(["capa"], "capa-colada.png", { type: "image/png" })

    fireEvent.paste(window, {
      clipboardData: {
        items: [{ kind: "file", type: "image/png", getAsFile: () => image }],
      },
    })

    expect(screen.getByAltText("Prévia da capa")).toHaveAttribute("src", "blob:cover-preview")
  })
})
