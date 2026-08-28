"use client"

import { useEffect, useRef, useState } from "react"

const stats = [
  {
    value: 7,
    suffix: "",
    label: "anos de experiencia",
  },
  {
    value: 20,
    suffix: "+",
    label: "clientes atendidos",
  },
  {
    value: 10000,
    suffix: "+",
    label: "usuarios",
  },
]

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value)
}

function AnimatedCounter({
  value,
  suffix,
  shouldStart,
  delay,
}: {
  value: number
  suffix: string
  shouldStart: boolean
  delay: number
}) {
  const [currentValue, setCurrentValue] = useState(0)

  useEffect(() => {
    if (!shouldStart) return

    let animationFrame = 0
    const duration = 1400

    const timeout = setTimeout(() => {
      const startedAt = performance.now()

      const animate = (timestamp: number) => {
        const progress = Math.min((timestamp - startedAt) / duration, 1)
        const easedProgress = 1 - Math.pow(1 - progress, 3)

        setCurrentValue(Math.round(value * easedProgress))

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        }
      }

      animationFrame = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(animationFrame)
    }
  }, [delay, shouldStart, value])

  return (
    <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
      {suffix}
      {formatNumber(currentValue)}
    </span>
  )
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [shouldStart, setShouldStart] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldStart(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )

    observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-black py-12 md:py-16">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto grid max-w-5xl gap-8 text-center md:grid-cols-3 md:gap-6">
          {stats.map((stat, index) => (
            <div key={stat.label} className="relative">
              <div className="text-[clamp(3rem,7vw,5.5rem)] font-bold leading-none tracking-normal">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  shouldStart={shouldStart}
                  delay={index * 130}
                />
              </div>
              <p className="mt-3 text-base font-medium text-white md:text-lg">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
