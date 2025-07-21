"use client"

import { useRef } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import { GLTFLoader, GLTF } from "three-stdlib"
import { Group } from "three"

export default function OmiModel() {
  const modelRef = useRef<Group>(null)
  let gltf: GLTF | null = null
  try {
    gltf = useLoader(GLTFLoader, "/omi.glb")
  } catch (error) {
    console.error("Failed to load GLTF model:", error)
    return null
  }

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005
    }
  })

  return <primitive ref={modelRef} object={gltf.scene} dispose={null} />
}
