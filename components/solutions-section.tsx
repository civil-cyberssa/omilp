import { ArrowUpRight, Code2, Gamepad2, Globe2, Waypoints } from "lucide-react"

const solutions = [
  {
    title: "Software sob medida",
    kicker: "Sistema operacional do negócio",
    description: "Painéis, fluxos, permissões, dados e integrações desenhados em cima da rotina real da empresa.",
    icon: Code2,
    accent: "bg-cyan-300",
    tone: "from-cyan-300/20 via-blue-400/10 to-transparent",
    marker: "01",
    metric: "Processos internos",
    signals: ["Backoffice", "CRM", "Gestão", "Dashboards"],
  },
  {
    title: "Sites e landing pages",
    kicker: "Presença que converte",
    description: "Páginas rápidas, responsivas e orientadas a venda, com estrutura clara para tráfego e captação.",
    icon: Globe2,
    accent: "bg-fuchsia-300",
    tone: "from-fuchsia-300/20 via-purple-400/10 to-transparent",
    marker: "02",
    metric: "Aquisição digital",
    signals: ["Institucional", "Landing", "SEO", "Analytics"],
  },
  {
    title: "Desenvolvimento de jogos",
    kicker: "Experiências interativas",
    description: "Jogos, simuladores e interações gamificadas para educação, marca, treinamento ou produto.",
    icon: Gamepad2,
    accent: "bg-amber-200",
    tone: "from-amber-200/20 via-orange-400/10 to-transparent",
    marker: "03",
    metric: "Engajamento",
    signals: ["Web game", "3D", "Treinamento", "Campanhas"],
  },
  {
    title: "Consultoria em TI",
    kicker: "Direção técnica",
    description: "Diagnóstico, arquitetura, priorização e plano técnico para destravar decisões de produto e operação.",
    icon: Waypoints,
    accent: "bg-emerald-300",
    tone: "from-emerald-300/20 via-teal-400/10 to-transparent",
    marker: "04",
    metric: "Clareza técnica",
    signals: ["Auditoria", "Roadmap", "Arquitetura", "Integrações"],
  },
]

export default function SolutionsSection() {
  return (
    <section id="solutions" className="relative overflow-hidden bg-white py-20 text-slate-950 md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_16%,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_82%_24%,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(236,72,153,0.12),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f8fbff_48%,#ffffff_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-400/25 to-transparent" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mb-12 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
    
            <h2 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
              Escolha o tipo de produto que precisa entrar no seu{" "}
              <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                mapa digital
              </span>
              .
            </h2>
          </div>
          <p className="max-w-sm text-base leading-7 text-slate-600">
            Em vez de pacotes prontos, cada frente nasce como uma peça do mesmo sistema: estratégia, interface,
            automação e dados conectados.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#030711]/90 shadow-[0_24px_120px_rgba(34,211,238,0.10)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(103,232,249,0.13),transparent_34%)]" />
          <div className="absolute left-8 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-transparent via-cyan-200/30 to-transparent lg:block" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-purple-400/10 blur-3xl" />

          <div className="relative">
            <div className="divide-y divide-white/10">
              {solutions.map((solution) => {
                const Icon = solution.icon

                return (
                  <article
                    key={solution.title}
                    className="group relative grid gap-5 overflow-hidden p-5 transition duration-300 hover:bg-white/[0.035] md:grid-cols-[7rem_1fr] md:p-7"
                  >
                    <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${solution.tone} opacity-0 transition duration-300 group-hover:opacity-100`} />
                    <div className={`absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l ${solution.tone} opacity-0 transition duration-300 group-hover:opacity-100`} />

                    <div className="relative flex items-center gap-4 md:block">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/70 text-xs font-semibold tracking-[0.18em] text-white shadow-[0_0_34px_rgba(0,0,0,0.35)]">
                        {solution.marker}
                      </span>
                      <div className="mt-0 flex items-center md:mt-6">
                        <span className={`h-2.5 w-2.5 rounded-full ${solution.accent} shadow-[0_0_18px_currentColor]`} />
                      </div>
                    </div>

                    <div className="relative grid gap-6 lg:grid-cols-[1fr_15rem] lg:items-center">
                      <div>
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-white shadow-[inset_0_0_28px_rgba(255,255,255,0.04)]">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
                            {solution.kicker}
                          </p>
                        </div>

                        <h3 className="text-2xl font-bold leading-tight text-white drop-shadow-[0_0_22px_rgba(255,255,255,0.16)] md:text-3xl">
                          {solution.title}
                        </h3>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/90 md:text-base">
                          {solution.description}
                        </p>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-black/35 p-4 backdrop-blur-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                            Foco
                          </span>
                          <ArrowUpRight className="h-4 w-4 text-white/35 transition group-hover:text-white/70" aria-hidden="true" />
                        </div>
                        <p className="text-sm font-semibold text-white">{solution.metric}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {solution.signals.map((signal) => (
                            <span
                              key={signal}
                              className="rounded-full border border-white/20 bg-white/[0.09] px-3 py-1 text-xs font-medium text-white/90"
                            >
                              {signal}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
