"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { Group } from "three"

export default function OmiModel() {
  const modelRef = useRef<Group>(null)
  const { scene } = useGLTF("omi.glb")

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005
    }
  })

  return <primitive ref={modelRef} object={scene} dispose={null} />
}

useGLTF.preload("omi.glb")

