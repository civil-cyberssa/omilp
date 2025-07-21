"use client"

import { useRef, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Float } from "@react-three/drei"
import OmiModel from "./omi-model"

export default function HeroSection() {
  const productsRef = useRef(null)

  const handleScrollClick = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black z-0"></div>

      {/* Animated gradient circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-6 z-10 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="block">Redefinindo</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Experiências Digitais
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-lg mx-auto lg:mx-0">
            Criamos soluções de software inovadoras que transformam como empresas se conectam com seus clientes.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <button className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all">
              Conheça os Produtos
            </button>
            <button className="px-8 py-3 rounded-full bg-white/10 backdrop-blur-sm text-white font-medium hover:bg-white/20 transition-all">
              Assista à Demo
            </button>
          </div>
        </div>

        <div className="lg:w-1/2 h-[400px] lg:h-[600px]">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} />

            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={2}>
              <Suspense fallback={null}>
                <OmiModel />
              </Suspense>
            </Float>

            <Environment preset="city" />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
        </div>
      </div>

      {/* Scroll indicator - Agora clicável */}
      <div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
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

