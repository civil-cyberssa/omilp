import {
  Bot,
  Code2,
  Database,
  Globe2,
  PlugZap,
  Smartphone,
} from "lucide-react"

const modules = [
  {
    title: "Portal web",
    description: "Experiencias publicas, landing pages e areas logadas.",
    icon: Globe2,
    className: "lg:left-[7%] lg:top-[12%]",
    tone: "from-cyan-300 to-blue-500",
  },
  {
    title: "Painel interno",
    description: "Operacao, usuarios, permissoes e fluxos sob controle.",
    icon: Code2,
    className: "lg:right-[8%] lg:top-[10%]",
    tone: "from-fuchsia-300 to-violet-500",
  },
  {
    title: "App mobile",
    description: "Jornadas rapidas para clientes, equipe ou campo.",
    icon: Smartphone,
    className: "lg:left-[3%] lg:bottom-[18%]",
    tone: "from-lime-300 to-emerald-500",
  },
  {
    title: "Automacoes",
    description: "Rotinas que eliminam retrabalho e operam em segundo plano.",
    icon: Bot,
    className: "lg:right-[4%] lg:bottom-[20%]",
    tone: "from-orange-300 to-rose-500",
  },
  {
    title: "Banco de dados",
    description: "Informacao estruturada, historico e regras de negocio.",
    icon: Database,
    className: "lg:left-[34%] lg:bottom-[5%]",
    tone: "from-sky-300 to-indigo-500",
  },
  {
    title: "Integracoes",
    description: "Pagamentos, CRMs, ERPs, WhatsApp, APIs e ferramentas.",
    icon: PlugZap,
    className: "lg:left-[calc(50%-8rem)] lg:top-[7%]",
    tone: "from-amber-200 to-yellow-500",
  },
]

export default function SoftwareGrid({ id }: { id?: string }) {
  return (
    <section id={id} className="relative overflow-hidden bg-black py-24 text-white md:py-32">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(244,114,182,0.05)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="blueprint-scan absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cyan-300/10 to-transparent" />
      <div className="absolute -left-28 top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -right-24 bottom-24 h-80 w-80 rounded-full bg-rose-400/10 blur-3xl" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
          <h2 className="text-3xl font-bold leading-tight md:text-5xl">
            Um ecossistema sob medida, desenhado para a{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              sua operação
            </span>
            .
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
            Cada modulo conversa com o outro: interface, automacoes, dados e integracoes viram uma estrutura unica,
            pronta para crescer com a empresa.
          </p>
        </div>

        <div className="blueprint-board relative mx-auto hidden h-[720px] max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-[#030711]/90 shadow-[0_24px_120px_rgba(34,211,238,0.12)] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.14),transparent_34%),radial-gradient(circle_at_20%_20%,rgba(244,114,182,0.14),transparent_24%),radial-gradient(circle_at_80%_78%,rgba(250,204,21,0.11),transparent_26%)]" />

          <div className="absolute left-1/2 top-1/2 h-[21rem] w-[21rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/20" />
          <div className="blueprint-orbit absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/10" />

          <div className="blueprint-line blueprint-line-a" />
          <div className="blueprint-line blueprint-line-b" />
          <div className="blueprint-line blueprint-line-c" />
          <div className="blueprint-line blueprint-line-d" />
          <div className="blueprint-line blueprint-line-e" />
          <div className="blueprint-line blueprint-line-f" />

          <div
            className="blueprint-core absolute left-1/2 top-1/2 z-20 flex h-56 w-56 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-200/30 bg-black/70 shadow-[0_0_70px_rgba(34,211,238,0.2)] backdrop-blur-xl"
            role="img"
            aria-label="Sua empresa"
          >
            <span className="absolute inset-5 rounded-full border border-cyan-200/20" aria-hidden="true" />
            <span className="absolute inset-12 rounded-full border border-white/10 bg-cyan-300/10" aria-hidden="true" />
            <span className="absolute h-24 w-24 rounded-full bg-cyan-300/20 blur-xl" aria-hidden="true" />
            <span className="absolute h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_22px_rgba(103,232,249,0.9)]" aria-hidden="true" />
            <h3 className="relative z-10 flex items-center gap-2 rounded-full border border-cyan-200/25 bg-black/55 px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-50 shadow-[0_0_30px_rgba(34,211,238,0.16)] backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" aria-hidden="true" />
              Sua empresa
            </h3>
          </div>

          {modules.map((module, index) => {
            const Icon = module.icon

            return (
              <div
                key={module.title}
                className={`blueprint-node absolute z-20 w-64 rounded-[22px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.36)] backdrop-blur-xl ${module.className}`}
                style={{ animationDelay: `${index * 140}ms` }}
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${module.tone} text-black`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold">{module.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{module.description}</p>
              </div>
            )
          })}

          <div className="absolute bottom-6 left-6 right-6 z-20 grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-black/50 p-3 text-xs text-white/60 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]" />
              Dados sincronizados
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]" />
              APIs em movimento
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_16px_rgba(252,211,77,0.9)]" />
              Produto escalavel
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:hidden">
          <div className="flex justify-center">
            <div
              className="blueprint-core relative flex h-44 w-44 items-center justify-center rounded-full border border-cyan-200/30 bg-black/70 shadow-[0_0_70px_rgba(34,211,238,0.2)]"
              role="img"
              aria-label="Sua empresa"
            >
              <span className="absolute inset-4 rounded-full border border-cyan-200/20" aria-hidden="true" />
              <span className="absolute inset-10 rounded-full border border-white/10 bg-cyan-300/10" aria-hidden="true" />
              <span className="absolute h-20 w-20 rounded-full bg-cyan-300/20 blur-xl" aria-hidden="true" />
              <span className="absolute h-2.5 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.9)]" aria-hidden="true" />
              <h3 className="relative z-10 flex items-center gap-2 rounded-full border border-cyan-200/25 bg-black/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.16)] backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" aria-hidden="true" />
                Sua empresa
              </h3>
            </div>
          </div>

          {modules.map((module) => {
            const Icon = module.icon

            return (
              <div key={module.title} className="rounded-[22px] border border-white/10 bg-white/[0.055] p-5">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${module.tone} text-black`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold">{module.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{module.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
