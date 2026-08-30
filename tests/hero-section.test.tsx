import * as React from "react"
import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import HeroSection from "../components/hero-section"

// Mock para o Canvas do React Three Fiber
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas-mock">
      {React.Children.toArray(children).filter(
        (child) => React.isValidElement(child) && typeof child.type !== "string"
      )}
    </div>
  ),
}))

// Mock para componentes do drei
vi.mock("@react-three/drei", () => ({
  OrbitControls: () => <div data-testid="orbit-controls-mock" />,
  Float: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="float-mock">{children}</div>
  ),
}))

vi.mock("../components/omi-model", () => ({
  default: () => <div data-testid="omi-model-mock" />,
}))

describe("HeroSection", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((
      contextId: string
    ) => {
      if (
        contextId === "webgl2" ||
        contextId === "webgl" ||
        contextId === "experimental-webgl"
      ) {
        return {}
      }

      return null
    }) as HTMLCanvasElement["getContext"])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renderiza sem erros", async () => {
    render(<HeroSection />)

    // Verifica se os elementos principais estão presentes
    expect(screen.getByText("Software sob medida")).toBeInTheDocument()
    expect(screen.getByText("para empresas que crescem")).toBeInTheDocument()
    expect(screen.getByText("Solicitar orçamento")).toBeInTheDocument()
    // expect(screen.getByText("Ver soluções")).toBeInTheDocument()

    // Verifica se o Canvas foi renderizado
    expect(await screen.findByTestId("canvas-mock")).toBeInTheDocument()

    // Verifica se os componentes 3D foram renderizados
    expect(screen.getByTestId("float-mock")).toBeInTheDocument()
    expect(screen.getByTestId("omi-model-mock")).toBeInTheDocument()
    expect(screen.getByTestId("orbit-controls-mock")).toBeInTheDocument()
  })
})
