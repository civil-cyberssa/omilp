import Image from "next/image"
import Link from "next/link"
import { Building2, Instagram, Linkedin, MapPin, Phone } from "lucide-react"

const navLinks = [
  { label: "Produtos", href: "#products" },
  { label: "Soluções", href: "#solutions" },
  { label: "Clientes", href: "#clients" },
  { label: "Contato", href: "#contact" },
]

const solutionLinks = [
  "Software sob medida",
  "Sites e landing pages",
  "Desenvolvimento de jogos",
  "Consultoria em TI",
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#030303] text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
      <div className="absolute -left-24 bottom-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -right-24 top-10 h-64 w-64 rounded-full bg-fuchsia-400/10 blur-3xl" />

      <div className="container relative z-10 mx-auto px-6 py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Omi Tecnologia">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <Image
                  src="/logo_perfil.pnng-removebg-preview.png"
                  alt="Logo da Omi Tecnologia"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              </span>
              <span className="text-lg font-semibold tracking-wide">Omi Tecnologia</span>
            </Link>

            <p className="mt-5 text-sm leading-6 text-white/60">
              Desenvolvimento de software, sites, automações e experiências digitais para empresas que precisam
              transformar operação em produto.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://instagram.com/omi.tecnologia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-white/25 hover:text-white"
                aria-label="Instagram da Omi Tecnologia"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="https://www.linkedin.com/company/omitechnology/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-white/25 hover:text-white"
                aria-label="LinkedIn da Omi Tecnologia"
              >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.26em] text-white/45">Seções</h2>
            <nav className="mt-5 flex flex-col gap-3" aria-label="Links do rodapé">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/70 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.26em] text-white/45">Soluções</h2>
            <ul className="mt-5 space-y-3">
              {solutionLinks.map((solution) => (
                <li key={solution} className="text-sm text-white/70">
                  {solution}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.26em] text-white/45">Contato</h2>
            <ul className="mt-5 space-y-4">
              <li className="flex gap-3 text-sm text-white/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                <span>Salvador e São Paulo</span>
              </li>
              <li className="flex gap-3 text-sm text-white/70">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                <a href="tel:+5571992997191" className="transition hover:text-white">
                  71 9 9299-7191
                </a>
              </li>
              <li className="flex gap-3 text-sm text-white/70">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                <span>CNPJ 44.624.581/0001-08</span>
              </li>
            </ul>

            <a
              href="https://wa.me/5571992997191"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/15"
            >
              Chamar no WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/45 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} Omi Tecnologia. Todos os direitos reservados.</p>
          <p>Software e presença digital para Salvador, São Paulo e Brasil.</p>
        </div>
      </div>
    </footer>
  )
}
