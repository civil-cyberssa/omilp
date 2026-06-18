import Image from "next/image"

const clients = [
  {
    name: "Lei da Grana",
    logo: "/lei_da_grana_logo.png",
    width: 500,
    height: 500,
  },
  {
    name: "Veli",
    logo: "/Veli_logo azul clara.png",
    width: 1080,
    height: 671,
  },
  {
    name: "Instituto Joga Junto",
    logo: "/logo_ijj_branco.png",
    width: 1920,
    height: 906,
  },
  {
    name: "Brownie Baiano",
    logo: "/logo_browniebaiano_branca_nobg.png",
    width: 1024,
    height: 1024,
  },
  {
    name: "Civil",
    logo: "/Logo_CIVIL.png",
    width: 1133,
    height: 455,
  },
  {
    name: "Urus",
    logo: "/urus_logo_nobg_branca.png",
    width: 500,
    height: 500,
  },
]

export default function ClientsSection() {
  const logoRail = [...clients, ...clients]

  return (
    <section id="clients" className="relative overflow-hidden bg-black py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/10 to-black" />
      <div className="absolute left-1/2 top-1/2 h-64 w-[72rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03] blur-3xl" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            Tecnologia entregue para negócios reais.
          </h2>
          <p className="mt-4 text-base text-white/60 md:text-lg">
            Sistemas, sites e produtos digitais criados com foco em operação, venda e crescimento.
          </p>
        </div>

        <div
          className="logo-marquee group relative overflow-hidden border-y border-white/10 py-6"
          aria-label="Clientes atendidos pela Omi Tecnologia"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-black to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-black to-transparent" />

          <div className="logo-marquee-track flex w-max items-center gap-6">
            {logoRail.map((client, index) => (
              <div
                key={`${client.name}-${index}`}
                className="logo-marquee-item flex h-24 w-56 shrink-0 items-center justify-center px-6"
              >
                <div className="flex h-16 w-32 items-center justify-center">
                  <Image
                    src={client.logo}
                    alt={`Logo ${client.name}, cliente da Omi Tecnologia`}
                    width={client.width}
                    height={client.height}
                    className="h-full w-full object-contain opacity-55 grayscale transition duration-300 ease-out hover:scale-105 hover:opacity-100 hover:grayscale-0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
