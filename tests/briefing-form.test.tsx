import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { BriefingForm } from "@/components/briefing-form"

const refresh = vi.fn()

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  refresh.mockReset()
})

describe("BriefingForm", () => {
  it("envia sugestões de domínio e a cor hexadecimal no extra_data", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ id: "briefing-1" }, { status: 201 }))
    render(<BriefingForm />)

    fireEvent.change(screen.getByLabelText("Nome do projeto"), { target: { value: "Novo site" } })
    fireEvent.change(screen.getByLabelText("Conte sobre o negócio"), { target: { value: "Empresa de tecnologia" } })
    fireEvent.change(screen.getByLabelText("Objetivos do site"), { target: { value: "Gerar vendas" } })
    fireEvent.change(screen.getByLabelText("Primeira opção"), { target: { value: "omi-digital" } })
    fireEvent.change(screen.getByLabelText("Cor principal em hexadecimal"), { target: { value: "4338ff" } })
    fireEvent.click(screen.getByRole("button", { name: "Adicionar outra cor" }))
    fireEvent.change(screen.getByLabelText("Cor principal 2 em hexadecimal"), { target: { value: "00cc99" } })
    fireEvent.change(screen.getByLabelText("Qual cor evitar no seu projeto?"), { target: { value: "vermelho" } })
    fireEvent.click(screen.getByRole("button", { name: "Enviar briefing" }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const payload = JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body))
    expect(payload.extra_data).toEqual({
      domain: { has_domain: false, desired_options: ["www.omi-digital.com.br"] },
      brand_colors: { unsure: false, hex: "#4338FF", hexes: ["#4338FF", "#00CC99"] },
      color_to_avoid: "vermelho",
    })
  })

  it("alterna para domínio existente e nome descritivo da cor", () => {
    render(<BriefingForm />)

    fireEvent.click(screen.getByRole("switch", { name: "Já possui um domínio" }))
    expect(screen.getByLabelText("Qual é o seu domínio?")).toBeInTheDocument()
    expect(screen.queryByLabelText("Primeira opção")).toBeNull()

    fireEvent.click(screen.getByRole("switch", { name: "Não sei o hexadecimal" }))
    expect(screen.getByLabelText("Qual nome melhor descreve a cor?")).toBeInTheDocument()
    expect(screen.queryByLabelText("Cor principal em hexadecimal")).toBeNull()
  })

  it("sincroniza o seletor visual e permite remover cores adicionais", () => {
    render(<BriefingForm />)

    fireEvent.change(screen.getByLabelText("Selecionar cor principal em hexadecimal"), { target: { value: "#ff5500" } })
    expect(screen.getByLabelText("Cor principal em hexadecimal")).toHaveValue("ff5500")

    fireEvent.click(screen.getByRole("button", { name: "Adicionar outra cor" }))
    expect(screen.getByLabelText("Cor principal 2 em hexadecimal")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Remover cor principal 2" }))
    expect(screen.queryByLabelText("Cor principal 2 em hexadecimal")).toBeNull()
  })

  it("exibe as orientações nos campos de público e referências", () => {
    render(<BriefingForm />)

    expect(screen.getByLabelText("Público-alvo")).toHaveAttribute("placeholder", "Quem você quer impactar")
    expect(screen.getByLabelText("Referências visuais")).toHaveAttribute("placeholder", "Deixe aqui sites que você acha interessantes para referência")
  })

  it("oferece suporte pelo WhatsApp informado", () => {
    render(<BriefingForm />)
    expect(screen.getByRole("link", { name: /precisa de suporte/i })).toHaveAttribute("href", "https://wa.me/71992997191")
  })

  it("carrega e atualiza um briefing existente com PATCH", async () => {
    const onSuccess = vi.fn()
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ id: "briefing-1" }))
    render(<BriefingForm
      endpoint="/api/portal/briefings/briefing-1"
      method="PATCH"
      onSuccess={onSuccess}
      initialData={{
        id: "briefing-1",
        project_name: "Site atual",
        business_description: "Descrição atual",
        goals: "Objetivos atuais",
        target_audience: "Empresas",
        visual_references: "Referência",
        desired_pages: ["Início", "Contato"],
        brand_assets_url: "https://drive.google.com/example",
        extra_data: {
          domain: { has_domain: true, current: "www.example.com.br" },
          brand_colors: { unsure: true, name: "azul-marinho" },
          color_to_avoid: "vermelho",
        },
        status: "RECEIVED",
        created_at: "2026-08-27T12:00:00Z",
        updated_at: "2026-08-27T12:00:00Z",
        edited_at: null,
        subscription: null,
        order: null,
      }}
    />)

    expect(screen.getByLabelText("Nome do projeto")).toHaveValue("Site atual")
    expect(screen.getByLabelText("Páginas desejadas")).toHaveValue("Início, Contato")
    fireEvent.change(screen.getByLabelText("Objetivos do site"), { target: { value: "Novos objetivos" } })
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/portal/briefings/briefing-1",
      expect.objectContaining({ method: "PATCH" }),
    )
  })
})
