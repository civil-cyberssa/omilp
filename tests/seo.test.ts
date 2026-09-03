import { readFile } from "node:fs/promises"
import { describe, expect, it } from "vitest"

import { metadata } from "@/app/page"
import { metadata as customerAreaMetadata } from "@/app/area-cliente/layout"
import { metadata as checkoutMetadata } from "@/app/contratar/layout"
import robots from "@/app/robots"
import sitemap from "@/app/sitemap"

describe("SEO público", () => {
  it("define metadata específica e canonical para a landing page", () => {
    expect(metadata.title).toBe("Omi Tecnologia | Software sob medida e sites por assinatura")
    expect(metadata.description).toContain("Software sob medida")
    expect(metadata.alternates).toMatchObject({ canonical: "/" })
    expect(metadata.openGraph).toMatchObject({ url: "https://omitech.com.br", locale: "pt_BR" })
  })

  it("mantém as páginas públicas essenciais rastreáveis", () => {
    expect(robots().sitemap).toBe("https://omitech.com.br/sitemap.xml")
    expect(sitemap().map((entry) => entry.url)).toEqual(expect.arrayContaining([
      "https://omitech.com.br",
      "https://omitech.com.br/site-por-assinatura",
    ]))
  })

  it("impede a indexação de áreas privadas e do checkout", () => {
    expect(customerAreaMetadata.robots).toMatchObject({ index: false, follow: false })
    expect(checkoutMetadata.robots).toMatchObject({ index: false, follow: false })
  })

  it("publica um llms.txt explicando a assinatura e seus limites", async () => {
    const content = await readFile(`${process.cwd()}/public/llms.txt`, "utf8")

    expect(content).toContain("## Serviço de site por assinatura")
    expect(content).toContain("Solicitações de alteração")
    expect(content).toContain("https://omitech.com.br/site-por-assinatura#planos")
  })
})
