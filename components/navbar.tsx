"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"

const navLinks = [
  { label: "Produtos", href: "/#products" },
  { label: "Soluções", href: "/#solutions" },
  { label: "Clientes", href: "/#clients" },
  { label: "Blog", href: "/blog" },
  { label: "Site por assinatura", href: "/site-por-assinatura" },
  { label: "Contato", href: "/#contact" },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
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
          <Link href="/" className="flex items-center" aria-label="Omi Tecnologia — início">
            <Image
              src="/Logo Omi_Perfil Logo Branca 2.png"
              alt="Omi Tecnologia"
              width={128}
              height={64}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center">
            <Link
              href="/area-cliente"
              className="hidden md:inline-flex px-5 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-opacity"
            >
              Área do cliente
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-white md:hidden"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <nav
          className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 md:hidden ${
            menuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
          aria-label="Navegação móvel"
        >
          <div className="overflow-hidden">
            <div className="mt-4 flex flex-col gap-1 rounded-2xl border border-white/10 bg-black/90 p-3 backdrop-blur-xl">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/area-cliente"
                onClick={() => setMenuOpen(false)}
                className="mt-1 rounded-xl bg-gradient-to-r from-[#155EEF] via-[#4338FF] to-[#D000B8] px-4 py-3 text-sm font-semibold text-white"
              >
                Área do cliente
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
