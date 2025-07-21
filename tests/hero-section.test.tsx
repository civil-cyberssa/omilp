import { render, screen } from "@testing-library/react"
import HeroSection from "../components/hero-section"
import "@testing-library/jest-dom"

// Mock para o Canvas do React Three Fiber
jest.mock("@react-three/fiber", () => ({
  Canvas: ({ children }) => <div data-testid="canvas-mock">{children}</div>,
}))

// Mock para componentes do drei
jest.mock("@react-three/drei", () => ({
  OrbitControls: () => <div data-testid="orbit-controls-mock" />,
  Environment: () => <div data-testid="environment-mock" />,
  Float: ({ children }) => <div data-testid="float-mock">{children}</div>,
}))

jest.mock("../components/omi-model", () => () => (
  <div data-testid="omi-model-mock" />
))

describe("HeroSection", () => {
  it("renderiza sem erros", () => {
    render(<HeroSection />)

    // Verifica se os elementos principais estão presentes
    expect(screen.getByText("Redefinindo")).toBeInTheDocument()
    expect(screen.getByText("Experiências Digitais")).toBeInTheDocument()
    expect(screen.getByText("Solicitar Orçamento")).toBeInTheDocument()
    expect(screen.getByText("Ver soluções")).toBeInTheDocument()

    // Verifica se o Canvas foi renderizado
    expect(screen.getByTestId("canvas-mock")).toBeInTheDocument()

    // Verifica se os componentes 3D foram renderizados
    expect(screen.getByTestId("float-mock")).toBeInTheDocument()
    expect(screen.getByTestId("omi-model-mock")).toBeInTheDocument()
    expect(screen.getByTestId("orbit-controls-mock")).toBeInTheDocument()
    expect(screen.getByTestId("environment-mock")).toBeInTheDocument()
  })
})

