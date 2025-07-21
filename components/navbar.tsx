"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/30 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Omi
            </span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link href="#products" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              Produtos
            </Link>
            <Link href="#solutions" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              Soluções
            </Link>
            <Link href="#clients" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              Clientes
            </Link>
            <Link href="#contact" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              Contato
            </Link>
          </nav>

          <div className="flex items-center">
            <Link
              href="#contact"
              className="hidden md:inline-flex px-5 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-opacity"
            >
              Solicitar Orçamento
            </Link>
            <button className="md:hidden text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

