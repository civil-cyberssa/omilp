import Image from "next/image"

export default function ClientsSection() {
  const clients = [
    { id: 1, name: "TechCorp", logo: "/placeholder.svg?height=80&width=200" },
    { id: 2, name: "InnovateLabs", logo: "/placeholder.svg?height=80&width=200" },
    { id: 3, name: "FutureSystems", logo: "/placeholder.svg?height=80&width=200" },
    { id: 4, name: "GlobalTech", logo: "/placeholder.svg?height=80&width=200" },
    { id: 5, name: "NextGen", logo: "/placeholder.svg?height=80&width=200" },
    { id: 6, name: "DigitalEdge", logo: "/placeholder.svg?height=80&width=200" },
    { id: 7, name: "SmartSolutions", logo: "/placeholder.svg?height=80&width=200" },
    { id: 8, name: "CloudNine", logo: "/placeholder.svg?height=80&width=200" },
  ]

  const testimonials = [
    {
      id: 1,
      quote: "Omi transformed our digital infrastructure and helped us achieve unprecedented growth.",
      author: "Sarah Johnson",
      position: "CTO, TechCorp",
    },
    {
      id: 2,
      quote: "The innovative solutions provided by Omi have revolutionized how we interact with our customers.",
      author: "Michael Chen",
      position: "CEO, InnovateLabs",
    },
    {
      id: 3,
      quote: "Working with Omi has been a game-changer for our business operations and customer engagement.",
      author: "Elena Rodriguez",
      position: "COO, FutureSystems",
    },
  ]

  return (
    <section id="clients" className="py-20 md:py-32 bg-black relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Industry Leaders
            </span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Partnering with forward-thinking companies to drive digital transformation
          </p>
        </div>

        {/* Clients logos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-center p-6 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-colors"
            >
              <Image
                src={client.logo || "/placeholder.svg"}
                alt={client.name}
                width={200}
                height={80}
                className="max-h-12 w-auto opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10"
            >
              <svg className="w-10 h-10 text-purple-500 mb-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-lg text-white/90 mb-6">{testimonial.quote}</p>
              <div>
                <p className="font-medium text-white">{testimonial.author}</p>
                <p className="text-sm text-white/60">{testimonial.position}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

