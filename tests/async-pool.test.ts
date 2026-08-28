import { describe, expect, it } from "vitest"

import { runWithConcurrency } from "@/lib/async-pool"

describe("runWithConcurrency", () => {
  it("limita tarefas simultâneas e preserva a ordem dos resultados", async () => {
    let active = 0
    let maximumActive = 0

    const results = await runWithConcurrency([1, 2, 3, 4, 5], 2, async (value) => {
      active += 1
      maximumActive = Math.max(maximumActive, active)
      await Promise.resolve()
      active -= 1
      return value * 2
    })

    expect(maximumActive).toBe(2)
    expect(results).toEqual([
      { status: "fulfilled", value: 2 },
      { status: "fulfilled", value: 4 },
      { status: "fulfilled", value: 6 },
      { status: "fulfilled", value: 8 },
      { status: "fulfilled", value: 10 },
    ])
  })

  it("isola falhas sem interromper os demais itens", async () => {
    const results = await runWithConcurrency(["ok", "falha", "depois"], 3, async (value) => {
      if (value === "falha") throw new Error("arquivo inválido")
      return value
    })

    expect(results[0]).toEqual({ status: "fulfilled", value: "ok" })
    expect(results[1].status).toBe("rejected")
    expect(results[2]).toEqual({ status: "fulfilled", value: "depois" })
  })
})
