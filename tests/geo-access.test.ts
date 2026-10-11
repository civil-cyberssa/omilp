import { describe, expect, it } from "vitest"

import { isBrazilianAccessAllowed } from "@/lib/geo-access"

describe("restrição geográfica do frontend", () => {
  it("permite acessos identificados como brasileiros", () => {
    expect(isBrazilianAccessAllowed("BR", true)).toBe(true)
    expect(isBrazilianAccessAllowed("br", true)).toBe(true)
  })

  it("bloqueia outros países e origem desconhecida na Vercel", () => {
    expect(isBrazilianAccessAllowed("US", true)).toBe(false)
    expect(isBrazilianAccessAllowed(undefined, true)).toBe(false)
  })

  it("não bloqueia desenvolvimento e testes fora da Vercel", () => {
    expect(isBrazilianAccessAllowed(undefined, false)).toBe(true)
  })
})
