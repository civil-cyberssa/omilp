import Image from "next/image"

export default function SoftwareGrid({ id }: { id?: string }) {
  const screenshots = [
    {
      id: 1,
      title: "Analytics Dashboard",
      description: "Real-time data visualization platform",
      image: "/placeholder.svg?height=600&width=800",
      size: "large",
    },
    {
      id: 2,
      title: "Mobile App",
      description: "Cross-platform mobile experience",
      image: "/placeholder.svg?height=400&width=300",
      size: "small",
    },
    {
      id: 3,
      title: "AI Assistant",
      description: "Intelligent virtual assistant",
      image: "/placeholder.svg?height=500&width=400",
      size: "medium",
    },
    {
      id: 4,
      title: "Cloud Platform",
      description: "Scalable cloud infrastructure",
      image: "/placeholder.svg?height=300&width=500",
      size: "medium",
    },
    {
      id: 5,
      title: "Security Suite",
      description: "Enterprise-grade security solution",
      image: "/placeholder.svg?height=600&width=400",
      size: "large",
    },
    {
      id: 6,
      title: "IoT Control Center",
      description: "Connected device management",
      image: "/placeholder.svg?height=400&width=600",
      size: "medium",
    },
  ]

  return (
    <section id={id} className="py-20 md:py-32 bg-black relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Cutting-edge
            </span>{" "}
            Software Solutions
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Our suite of innovative products designed to transform your digital landscape
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
                alt={item.title}
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

