import { cleanup, render, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ trackCheckoutError: vi.fn() }))
vi.mock("@/lib/checkout-error-analytics", () => ({ trackCheckoutError: mocks.trackCheckoutError }))

import { CheckoutRuntimeErrorTracker } from "@/components/checkout-runtime-error-tracker"

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("CheckoutRuntimeErrorTracker", () => {
  it("captura erros JavaScript na página de contratação", async () => {
    render(<CheckoutRuntimeErrorTracker />)

    window.dispatchEvent(new ErrorEvent("error", {
      message: "Falha inesperada",
      filename: "https://omi.test/chunk.js",
      lineno: 10,
      colno: 4,
      error: new TypeError("Falha inesperada"),
    }))

    await waitFor(() => expect(mocks.trackCheckoutError).toHaveBeenCalledWith({
      errorType: "runtime_error",
      errorCode: "TypeError",
      message: "Falha inesperada",
      endpoint: "https://omi.test/chunk.js",
      inputs: { line: 10, column: 4 },
    }))
  })
})
