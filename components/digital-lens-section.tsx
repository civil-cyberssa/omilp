export default function DigitalLensSection() {
  return (
    <section className="relative overflow-hidden bg-black py-20 md:py-32">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#000_0%,#030303_52%,#000_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="container relative z-10 mx-auto grid min-h-[460px] items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-4xl">
          <h2 className="text-[clamp(2.5rem,6vw,6.5rem)] font-light leading-[1.05] tracking-normal text-white/90">
            Podemos ajudar você a{" "}
            <span className="font-semibold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              reimaginar
            </span>{" "}
            seu negócio por uma lente digital.
          </h2>
        </div>

        <div className="relative mx-auto flex h-[320px] w-full max-w-[520px] items-center justify-center md:h-[420px]">
          <div className="digital-lens-shell absolute h-[72%] w-[58%] rotate-6 border border-cyan-200/20 bg-cyan-200/[0.03] shadow-[0_0_80px_rgba(34,211,238,0.12)] backdrop-blur-sm" />
          <div className="absolute h-[62%] w-[46%] -rotate-6 border border-purple-200/20 bg-purple-200/[0.04] shadow-[0_0_90px_rgba(168,85,247,0.16)] backdrop-blur-md" />

          <div className="relative h-[70%] w-[56%] overflow-hidden border border-white/20 bg-black/40 shadow-[inset_0_0_60px_rgba(255,255,255,0.06),0_0_100px_rgba(99,102,241,0.18)]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:34px_34px]" />
            <div className="digital-lens-scan absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-200/25 to-transparent" />
            <div className="absolute left-8 top-8 h-12 w-24 border-l border-t border-cyan-200/60" />
            <div className="absolute bottom-8 right-8 h-12 w-24 border-b border-r border-purple-200/60" />
            <div className="absolute inset-8 border border-white/10" />
          </div>
        </div>
      </div>
    </section>
  )
}
