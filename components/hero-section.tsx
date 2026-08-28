"use client"

import { useEffect, useRef, Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, Float, OrbitControls } from "@react-three/drei"
import { ArrowUpRight, ChevronDown, MessageCircle, Send } from "lucide-react"
import OmiModel from "./omi-model"

function hasWebGLSupport() {
  try {
    const canvas = document.createElement("canvas")
    const context =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")

    return Boolean(context)
  } catch {
    return false
  }
}

function HeroModelFallback() {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      aria-label="Visual abstrato da Omi Tecnologia"
      role="img"
    >
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/20 bg-cyan-300/10 shadow-[0_0_90px_rgba(34,211,238,0.18)] md:h-80 md:w-80" />
      <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-purple-300/25 bg-purple-400/10 shadow-[0_0_80px_rgba(168,85,247,0.2)] md:h-56 md:w-56" />
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-500 shadow-[0_0_70px_rgba(99,102,241,0.36)]" />
      <div className="absolute inset-x-[20%] top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent" />
      <div className="absolute inset-y-[18%] left-1/2 w-px bg-gradient-to-b from-transparent via-purple-200/35 to-transparent" />
    </div>
  )
}

function HeroModelStage() {
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    setWebglAvailable(hasWebGLSupport())
  }, [])

  if (!webglAvailable) {
    return <HeroModelFallback />
  }

  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [0, 0, 5.2], fov: 42 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, failIfMajorPerformanceCaveat: false, powerPreference: "default" }}
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <pointLight position={[-4, -2, 3]} intensity={1.5} />

      <Float speed={1.1} rotationIntensity={0.18} floatIntensity={0.45}>
        <Suspense fallback={null}>
          <OmiModel scale={1.33} />
        </Suspense>
      </Float>

      <Environment preset="city" environmentIntensity={0.7} />
      <OrbitControls enableZoom={false} enablePan={false} target={[0, 0, 0]} />
    </Canvas>
  )
}

export default function HeroSection() {
  const productsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [isBudgetMenuOpen, setIsBudgetMenuOpen] = useState(false)

  const handleScrollClick = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!ctaRef.current?.contains(event.target as Node)) {
        setIsBudgetMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsBudgetMenuOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <section className="relative flex h-screen w-full items-start justify-center overflow-hidden pt-24 lg:items-center lg:pt-0">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black z-0"></div>

      {/* Animated gradient circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-6 z-10 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="block">Software sob medida</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              para empresas que crescem
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-lg mx-auto lg:mx-0">
            Transformamos processos complexos em produtos digitais claros, rápidos e prontos para evoluir.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <div ref={ctaRef} className="relative mx-auto w-full max-w-sm sm:mx-0 sm:w-auto">
              <button
                type="button"
                aria-label="Abrir opções para solicitar orçamento"
                aria-expanded={isBudgetMenuOpen}
                aria-controls="hero-budget-options"
                onClick={() => setIsBudgetMenuOpen((isOpen) => !isOpen)}
                className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/25 sm:w-auto"
              >
                Solicitar orçamento
                <ChevronDown
                  className={`h-4 w-4 transition duration-300 ${isBudgetMenuOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              <div
                id="hero-budget-options"
                className={`absolute left-1/2 top-full z-30 mt-4 w-[min(22rem,calc(100vw-3rem))] -translate-x-1/2 overflow-hidden rounded-[22px] border border-white/10 bg-[#030711]/95 text-left shadow-[0_24px_80px_rgba(34,211,238,0.16)] backdrop-blur-xl transition duration-300 sm:left-0 sm:translate-x-0 ${
                  isBudgetMenuOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-2 opacity-0"
                }`}
              >
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(244,114,182,0.05)_1px,transparent_1px)] bg-[size:28px_28px]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent" />

                <div className="relative divide-y divide-white/10">
                  <a
                    href="https://wa.me/5571992997191"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsBudgetMenuOpen(false)}
                    className="group/option grid grid-cols-[2.75rem_1fr_auto] items-center gap-3 p-4 transition hover:bg-white/[0.045]"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-200/20 bg-cyan-300/10 text-cyan-100 shadow-[0_0_34px_rgba(34,211,238,0.12)]">
                      <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">
                        Fale com um especialista agora
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-white/52">
                        Atendimento direto pelo WhatsApp.
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-white/35 transition group-hover/option:text-white/80" aria-hidden="true" />
                  </a>

                  <a
                    href="#contact"
                    onClick={() => setIsBudgetMenuOpen(false)}
                    className="group/option grid grid-cols-[2.75rem_1fr_auto] items-center gap-3 p-4 transition hover:bg-white/[0.045]"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-purple-200/20 bg-purple-300/10 text-purple-100 shadow-[0_0_34px_rgba(168,85,247,0.12)]">
                      <Send className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">
                        Mande uma mensagem no formulário
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-white/52">
                        Conte o contexto e retornamos com o próximo passo.
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-white/35 transition group-hover/option:text-white/80" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
            {/* <button
              aria-label="Assista à demonstração das soluções digitais da Omi"
              className="px-8 py-3 rounded-full bg-white/10 backdrop-blur-sm text-white font-medium hover:bg-white/20 transition-all"
            >
              Ver soluções
            </button> */}
          </div>
        </div>

        <div className="h-[320px] w-full sm:h-[420px] lg:h-[600px] lg:w-1/2">
          <HeroModelStage />
        </div>
      </div>

      {/* Scroll indicator - Agora clicável */}
      <div
        className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 transform cursor-pointer flex-col items-center lg:flex"
        onClick={handleScrollClick}
      >
        <span className="text-sm text-white/50 mb-2">Role para explorar</span>
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-white/70 rounded-full mt-2 animate-scroll-down"></div>
        </div>
      </div>

      {/* Referência invisível para o scroll */}
      <div ref={productsRef} className="absolute bottom-0"></div>
    </section>
  )
}
