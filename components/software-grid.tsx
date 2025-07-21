import Image from "next/image"

export default function SoftwareGrid({ id }: { id?: string }) {
  const screenshots = [
    {
      id: 1,
      title: "ERP Empresarial",
      description: "O software sob medida para sua empresa",
      image: "/ijj.png",
      size: "large",
    },
    // {
    //   id: 2,
    //   title: "Mobile App",
    //   description: "Cross-platform mobile experience",
    //   image: "/placeholder.svg?height=400&width=300",
    //   size: "small",
    // },
    {
      id: 3,
      title: "Sistema de Agendamento",
      description: "Sistema de agendamento inteligente",
      image: "/urus.png",
      size: "medium",
    },
    {
      id: 4,
      title: "Web App",
      description: "Aplicativo web responsivo e intuitivo",
      image: "/cive_2.png",
      size: "medium",
    },
    {
      id: 5,
      title: "Landing Page Profissional",
      description: "Sua presença online otimizada",
      image: "/lei_da_grana.png",
      size: "large",
    },
    // {
    //   id: 6,
    //   title: "IoT Control Center",
    //   description: "Connected device management",
    //   image: "/placeholder.svg?height=400&width=600",
    //   size: "medium",
    // },
  ]

  return (
    <section id={id} className="py-20 md:py-32 bg-black relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Soluções de Software
            </span>{" "}
            Inovadoras
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Nossa suíte de produtos inovadores projetados para transformar o seu ambiente digital
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {screenshots.map((item) => (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-2xl ${
                item.size === "large"
                  ? "md:col-span-2 md:row-span-2"
                  : item.size === "medium"
                    ? "md:col-span-1 md:row-span-2"
                    : ""
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>

              <Image
                src={item.image || "/placeholder.svg"}
                alt={`Captura de tela do ${item.title} desenvolvido pela Omi em Salvador`}
                width={800}
                height={600}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/70">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

