"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { Group } from "three"

type OmiModelProps = {
  scale?: number
}

const MODEL_CENTER_Y = 0.7504

export default function OmiModel({ scale = 1 }: OmiModelProps) {
  const modelRef = useRef<Group>(null)
  const { scene } = useGLTF("/omi.glb")

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005
    }
  })

  return (
    <group ref={modelRef} scale={scale}>
      <primitive object={scene} dispose={null} position={[0, -MODEL_CENTER_Y, 0]} />
    </group>
  )
}

useGLTF.preload("/omi.glb")
