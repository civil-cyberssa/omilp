const methodologySteps = [
  {
    number: "01",
    title: "Briefing",
    description:
      "Mapeamos objetivo, público, rotina e prioridade. O projeto começa com problema claro, não com tela solta.",
  },
  {
    number: "02",
    title: "Desenho",
    description:
      "Organizamos fluxos, regras e escopo do MVP. O cliente valida caminhos antes do desenvolvimento pesado.",
  },
  {
    number: "03",
    title: "MVP",
    description:
      "Construímos a primeira versão funcional em ciclos curtos, com entregas visíveis e decisões semanais.",
  },
  {
    number: "04",
    title: "Validação",
    description:
      "Testamos com usuários, métricas e operação real. Ajustamos o que importa antes de escalar.",
  },
  {
    number: "05",
    title: "Evolução",
    description:
      "Depois do MVP, priorizamos melhorias por impacto: automação, performance, integrações e novas features.",
  },
]

export default function ImmersiveSection() {
  return (
    <section className="relative overflow-hidden bg-black py-20 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.18),transparent_34%),radial-gradient(circle_at_82%_28%,rgba(168,85,247,0.16),transparent_30%),linear-gradient(180deg,#000,#050505_46%,#000)]" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Como funciona o processo
            </span>
          </h2>
          <p className="text-lg text-white/70">
            Briefing, desenho e MVP em ciclos ágeis. Você participa de cada etapa, valida decisões cedo e acompanha a evolução do produto enquanto ele nasce.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-blue-300/35 to-transparent lg:block" />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {methodologySteps.map((step) => (
              <article
                key={step.number}
                className="group relative border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300/40 hover:bg-white/[0.07]"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center border border-blue-300/30 bg-black text-sm font-semibold text-blue-200 shadow-[0_0_30px_rgba(59,130,246,0.18)] transition group-hover:border-blue-200 group-hover:text-white">
                    {step.number}
                  </div>
                  <div className="hidden h-px flex-1 bg-white/10 lg:ml-4 lg:block" />
                </div>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
