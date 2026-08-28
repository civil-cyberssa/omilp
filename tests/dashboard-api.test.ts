import { describe, expect, it } from "vitest"

import { formatDashboardDateTime, formatFileSize } from "@/lib/dashboard-api"

describe("formatDashboardDateTime", () => {
  it("formata data e hora no fuso de Salvador", () => {
    expect(formatDashboardDateTime("2026-08-27T17:57:00Z")).toBe(
      "27 de ago. de 2026 às 14:57",
    )
  })

  it("usa travessão quando a data não está disponível ou é inválida", () => {
    expect(formatDashboardDateTime(null)).toBe("—")
    expect(formatDashboardDateTime("data-inválida")).toBe("—")
  })
})

describe("formatFileSize", () => {
  it("formata bytes em unidades legíveis", () => {
    expect(formatFileSize(512)).toBe("512 B")
    expect(formatFileSize(1536)).toBe("1,5 KB")
    expect(formatFileSize(2 * 1024 * 1024)).toBe("2 MB")
  })
})
