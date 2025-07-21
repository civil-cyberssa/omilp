"use client"

import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"
import { useEffect, useState, useMemo } from "react"
import * as THREE from "three"

// Componente 3D de iPhone interativo
function PhoneModel() {
  // Usar um estado para garantir que o componente só renderize no cliente
  const [mounted, setMounted] = useState(false)

  // Criar a textura do texto "Omi" com gradiente
  const textTexture = useMemo(() => {
    if (typeof window === "undefined") return null

    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 256
    const context = canvas.getContext("2d")

    if (context) {
      context.fillStyle = "#111111"
      context.fillRect(0, 0, canvas.width, canvas.height)

      context.font = "bold 120px Arial, sans-serif"
      context.textAlign = "center"
      context.textBaseline = "middle"

      // Gradiente para o texto
      const gradient = context.createLinearGradient(0, 0, canvas.width, 0)
      gradient.addColorStop(0, "#4f46e5")
      gradient.addColorStop(0.5, "#8b5cf6")
      gradient.addColorStop(1, "#ec4899")

      context.fillStyle = gradient
      context.fillText("Omi", canvas.width / 2, canvas.height / 2)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !textTexture) return null

  return (
    <group>
      {/* Corpo do iPhone */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 4.4, 0.2]} />
        <meshStandardMaterial color="#e4e4e4" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Bordas arredondadas */}
      <mesh position={[1.05, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 4.4, 16, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#e4e4e4" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[-1.05, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 4.4, 16, 1, false, Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#e4e4e4" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[0, 2.15, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 2.2, 16, 1, false, 0, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#e4e4e4" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[0, -2.15, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 2.2, 16, 1, false, Math.PI, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#e4e4e4" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Tela */}
      <mesh position={[0, 0, 0.11]}>
        <boxGeometry args={[2.05, 4.1, 0.01]} />
        <meshStandardMaterial color="#111111" emissive="#222244" emissiveIntensity={0.5} />
      </mesh>

      {/* Texto "Omi" na tela */}
      <mesh position={[0, 0, 0.12]}>
        <planeGeometry args={[1.8, 0.8]} />
        <meshBasicMaterial map={textTexture} transparent opacity={0.9} />
      </mesh>

      {/* Notch do iPhone */}
      <mesh position={[0, 2, 0.15]}>
        <boxGeometry args={[0.6, 0.15, 0.1]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Botões laterais */}
      <mesh position={[-1.15, 0.8, 0]}>
        <boxGeometry args={[0.05, 0.3, 0.05]} />
        <meshStandardMaterial color="#d0d0d0" />
      </mesh>

      <mesh position={[-1.15, 0.4, 0]}>
        <boxGeometry args={[0.05, 0.3, 0.05]} />
        <meshStandardMaterial color="#d0d0d0" />
      </mesh>

      <mesh position={[1.15, 0.6, 0]}>
        <boxGeometry args={[0.05, 0.5, 0.05]} />
        <meshStandardMaterial color="#d0d0d0" />
      </mesh>
    </group>
  )
}

export default function ImmersiveSection() {
  return (
    <section className="h-screen w-full relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 z-10"></div>

      <div className="container mx-auto px-6 h-full flex flex-col lg:flex-row items-center justify-center relative z-20">
        <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Toque o Futuro
            </span>
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg mx-auto lg:mx-0">
            Nossa tecnologia cria interações perfeitas entre usuários e interfaces digitais. Experimente o poder de um design intuitivo que responde a cada gesto seu.
          </p>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg mx-auto lg:mx-0">
            Interaja com nosso modelo 3D para ver como estamos redefinindo as experiências móveis. Gire, aproxime e explore nosso design de próxima geração.
          </p>
          <button className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all">
            Conheça a Tecnologia
          </button>
        </div>

        <div className="lg:w-1/2 h-[400px] lg:h-[500px] backdrop-blur-sm bg-black/30 p-8 rounded-2xl">
          <div className="w-full h-full">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
              <PhoneModel />
              <Environment preset="night" />
              <OrbitControls enableZoom={true} maxZoom={1.5} minZoom={0.5} autoRotate={false} enablePan={false} />
            </Canvas>
          </div>
        </div>
      </div>
    </section>
  )
}

