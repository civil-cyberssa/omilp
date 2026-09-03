"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, CheckCircle2, Copy, CreditCard, Loader2, LockKeyhole, MapPin, QrCode, ShieldCheck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Controller, type FieldErrors, type FieldPath, type UseFormReturn, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatApiError } from "@/lib/client-api-error"
import { formatMoney } from "@/lib/commerce"
import { trackAnalyticsEvent } from "@/lib/analytics"

const personSchema = z.object({
  name: z.string().min(3, "Informe o nome completo"),
  email: z.string().email("Informe um e-mail válido"),
  phone: z.string().min(10, "Informe o telefone"),
  cpf_cnpj: z.string().min(11, "Informe o CPF ou CNPJ"),
  company: z.string().optional(),
  postal_code: z.string().min(8, "Informe um CEP válido"),
  street: z.string().min(2, "Informe a rua"),
  address_number: z.string().min(1, "Informe o número"),
  address_complement: z.string().optional(),
  neighborhood: z.string().min(2, "Informe o bairro"),
  city: z.string().min(2, "Informe a cidade"),
  city_code: z.string().min(1, "Consulte um CEP válido"),
  state: z.string().length(2, "Informe a UF"),
  country: z.string().length(2),
})

const creditCardSchema = z.object({
  holder_name: z.string().min(3, "Informe o nome impresso no cartão"),
  number: z.string().min(13, "Informe o número do cartão"),
  expiry_month: z.string().min(1, "Informe o mês"),
  expiry_year: z.string().length(4, "Use quatro dígitos"),
  ccv: z.string().min(3, "Informe o código").max(4, "Código inválido"),
})

export const checkoutSchema = z.object({
  customer: personSchema,
  billing_type: z.enum(["PIX", "CREDIT_CARD"]),
  cardholder_same_as_customer: z.boolean(),
  cardholder: personSchema.optional(),
  credit_card: creditCardSchema.optional(),
  installment_count: z.coerce.number().int().min(1).max(12),
}).superRefine((values, context) => {
  if (values.billing_type !== "CREDIT_CARD") return
  if (!values.credit_card) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["credit_card"], message: "Informe os dados do cartão" })
  }
  if (!values.cardholder_same_as_customer && !values.cardholder) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["cardholder"], message: "Informe os dados do titular" })
  }
})

type Values = z.infer<typeof checkoutSchema>
type PersonPrefix = "customer" | "cardholder"
type Offer = { slug: string; cycle: string; price: string }
type AddressData = { postal_code: string; street: string; address_complement: string; neighborhood: string; city: string; city_code: string; state: string; country: string }
type CheckoutResult = {
  resource_type: "order" | "subscription"
  id: string
  status: string
  billing_type: "PIX" | "CREDIT_CARD"
  payment_status: string
  payment_id?: string
  subscription_id?: string
  installment_count?: number
  pix?: { encoded_image: string; payload: string; expiration_date?: string | null }
  value?: number
  currency?: string
  content_id?: string
}
type CheckoutStatus = {
  resource_type: "order" | "subscription"
  status: string
  payment_status?: string | null
  confirmed: boolean
}

const inputClass = "h-12 border-white/15 bg-white/[.04] text-white placeholder:text-white/28 focus-visible:ring-[#596BFF]"

export function formatCreditCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 19)
  return digits.match(/.{1,4}/g)?.join(" ") ?? ""
}

export function normalizeBrazilianPhone(value: string) {
  const digits = value.replace(/\D/g, "")
  return digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits
}

function caretPositionForDigits(value: string, digitCount: number) {
  if (digitCount === 0) return 0
  let seen = 0
  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index])) seen += 1
    if (seen === digitCount) return index + 1
  }
  return value.length
}

function Message({ children }: { children?: string }) {
  return children ? <p className="text-xs text-pink-300">{children}</p> : null
}

function firstValidationMessage(errors: FieldErrors<Values>) {
  const customer = errors.customer
  const card = errors.credit_card
  const cardholder = errors.cardholder
  const candidates = [
    customer?.name?.message, customer?.email?.message, customer?.phone?.message,
    customer?.cpf_cnpj?.message, customer?.postal_code?.message, customer?.street?.message,
    customer?.address_number?.message, customer?.neighborhood?.message,
    customer?.city?.message, customer?.city_code?.message, customer?.state?.message,
    (card as { message?: string } | undefined)?.message,
    card?.number?.message, card?.holder_name?.message, card?.expiry_month?.message,
    card?.expiry_year?.message, card?.ccv?.message,
    (cardholder as { message?: string } | undefined)?.message,
    errors.billing_type?.message, errors.installment_count?.message,
  ]
  return candidates.find((message): message is string => typeof message === "string")
}

function AddressFields({ prefix, form, loading, lookup }: { prefix: PersonPrefix; form: UseFormReturn<Values>; loading: boolean; lookup: (prefix: PersonPrefix, value?: string) => Promise<void> }) {
  const { register, setValue, formState: { errors } } = form
  const names = prefix === "customer" ? {
    postal: "customer.postal_code" as const, street: "customer.street" as const, number: "customer.address_number" as const,
    complement: "customer.address_complement" as const, neighborhood: "customer.neighborhood" as const, city: "customer.city" as const,
    cityCode: "customer.city_code" as const, state: "customer.state" as const, country: "customer.country" as const,
  } : {
    postal: "cardholder.postal_code" as const, street: "cardholder.street" as const, number: "cardholder.address_number" as const,
    complement: "cardholder.address_complement" as const, neighborhood: "cardholder.neighborhood" as const, city: "cardholder.city" as const,
    cityCode: "cardholder.city_code" as const, state: "cardholder.state" as const, country: "cardholder.country" as const,
  }
  const fieldErrors = (prefix === "customer" ? errors.customer : errors.cardholder) as FieldErrors<z.infer<typeof personSchema>> | undefined
  const postalRegistration = register(names.postal)

  function handlePostalInput(event: React.FormEvent<HTMLInputElement>) {
    const value = event.currentTarget.value
    setValue(names.postal, value, { shouldDirty: true, shouldValidate: value.replace(/\D/g, "").length === 8 })
    void lookup(prefix, value)
  }

  return <div className="space-y-4 rounded-xl border border-white/10 bg-white/[.025] p-4 md:p-5">
    <div className="flex items-center gap-2 text-sm font-medium text-white/80"><MapPin className="h-4 w-4 text-[#8EA8FF]" />Endereço de cobrança</div>
    <div className="grid gap-4 md:grid-cols-[.75fr_1.25fr]">
      <div className="space-y-2"><Label htmlFor={names.postal}>CEP</Label><div className="relative"><Input id={names.postal} autoComplete="postal-code" inputMode="numeric" placeholder="00000-000" className={inputClass} {...postalRegistration} onInput={handlePostalInput} onAnimationStart={(event) => { if (event.animationName === "omi-autofill-start") handlePostalInput(event) }} onBlur={(event) => { postalRegistration.onBlur(event); void lookup(prefix, event.currentTarget.value) }} />{loading ? <Loader2 className="absolute right-3 top-4 h-4 w-4 animate-spin text-[#8EA8FF]" /> : null}</div><Message>{fieldErrors?.postal_code?.message}</Message></div>
      <div className="space-y-2"><Label htmlFor={names.street}>Rua</Label><Input id={names.street} autoComplete="address-line1" placeholder="Rua, avenida..." className={inputClass} {...register(names.street)} /><Message>{fieldErrors?.street?.message}</Message></div>
    </div>
    <div className="grid gap-4 md:grid-cols-[.55fr_1.45fr]">
      <div className="space-y-2"><Label htmlFor={names.number}>Número</Label><Input id={names.number} placeholder="123" className={inputClass} {...register(names.number)} /><Message>{fieldErrors?.address_number?.message}</Message></div>
      <div className="space-y-2"><Label htmlFor={names.complement}>Complemento (opcional)</Label><Input id={names.complement} autoComplete="address-line2" placeholder="Sala, apto, bloco..." className={inputClass} {...register(names.complement)} /></div>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2"><Label htmlFor={names.neighborhood}>Bairro</Label><Input id={names.neighborhood} className={inputClass} {...register(names.neighborhood)} /><Message>{fieldErrors?.neighborhood?.message}</Message></div>
      <div className="space-y-2"><Label htmlFor={names.city}>Cidade</Label><Input id={names.city} autoComplete="address-level2" className={inputClass} {...register(names.city)} /><Message>{fieldErrors?.city?.message}</Message></div>
    </div>
    <div className="w-28 space-y-2"><Label htmlFor={names.state}>Estado</Label><Input id={names.state} autoComplete="address-level1" maxLength={2} placeholder="BA" className={inputClass} {...register(names.state)} /><Message>{fieldErrors?.state?.message}</Message></div>
    <input type="hidden" {...register(names.cityCode)} /><input type="hidden" {...register(names.country)} />
  </div>
}

export function PaymentResult({ result }: { result: CheckoutResult }) {
  const router = useRouter()
  const isPix = result.billing_type === "PIX" && result.pix
  const qrSource = result.pix?.encoded_image.startsWith("data:") ? result.pix.encoded_image : `data:image/png;base64,${result.pix?.encoded_image}`
  const [confirmed, setConfirmed] = useState(false)
  const [terminal, setTerminal] = useState(false)
  const [statusMessage, setStatusMessage] = useState("Aguardando confirmação do pagamento")
  const purchaseTracked = useRef(false)

  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setTimeout> | undefined

    async function pollStatus() {
      try {
        const response = await fetch("/api/checkout/status", { cache: "no-store" })
        if (response.ok) {
          const data = await response.json() as CheckoutStatus
          if (!active) return
          if (data.confirmed) {
            if (!purchaseTracked.current) {
              purchaseTracked.current = true
              void trackAnalyticsEvent("purchase", {
                value: result.value ?? 0,
                currency: result.currency ?? "BRL",
                content_ids: result.content_id ? [result.content_id] : [],
                content_type: "product",
              })
            }
            setConfirmed(true)
            setStatusMessage("Pagamento confirmado")
            router.replace("/briefing")
            return
          }
          if (["CANCELED", "REFUNDED", "ERROR"].includes(data.status)) {
            setTerminal(true)
            setStatusMessage("O pagamento não foi confirmado")
            return
          }
        } else if ([401, 404].includes(response.status)) {
          setTerminal(true)
          setStatusMessage("Não foi possível localizar esta compra")
          return
        }
      } catch {
        // A próxima consulta tenta novamente; falhas transitórias não encerram o fluxo.
      }
      if (active) timer = setTimeout(pollStatus, 3000)
    }

    timer = setTimeout(pollStatus, 3000)
    return () => {
      active = false
      if (timer) clearTimeout(timer)
    }
  }, [result.content_id, result.currency, result.value, router])

  async function copyPix() {
    if (!result.pix?.payload) return
    try {
      await navigator.clipboard.writeText(result.pix.payload)
      toast.success("Código Pix copiado")
    } catch {
      toast.error("Não foi possível copiar. Selecione o código manualmente.")
    }
  }

  if (isPix) return <div className="space-y-7 text-center">
    <div><p className="text-xs font-semibold uppercase tracking-[.22em] text-[#8EA8FF]">Pagamento Pix</p><h3 className="mt-3 text-3xl font-semibold tracking-[-.03em]">Escaneie para pagar</h3><p className="mt-2 text-sm text-white/50">O pedido será atualizado automaticamente após a confirmação.</p></div>
    <div className="mx-auto w-fit rounded-2xl bg-white p-4 shadow-[0_0_60px_rgba(67,56,255,.28)]"><Image src={qrSource} alt="QR Code Pix do pedido" width={240} height={240} unoptimized /></div>
    <div className="space-y-2 text-left"><Label htmlFor="pix-payload">Pix copia e cola</Label><div className="flex gap-2"><Input id="pix-payload" readOnly value={result.pix?.payload ?? ""} className="h-12 border-white/15 bg-white/[.04] font-mono text-xs text-white" /><Button type="button" variant="outline" onClick={copyPix} className="h-12 border-white/15 bg-white/[.06] text-white hover:bg-white/10"><Copy className="h-4 w-4" /><span className="sr-only">Copiar código Pix</span></Button></div></div>
    <div className={`flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm ${confirmed ? "border-[#596BFF]/40 bg-[#4338FF]/15 text-[#C9CEFF]" : terminal ? "border-pink-400/25 bg-pink-400/[.07] text-pink-200" : "border-white/10 bg-white/[.035] text-white/55"}`}>{confirmed ? <CheckCircle2 className="h-4 w-4" /> : terminal ? <LockKeyhole className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}{statusMessage}</div>
    {confirmed ? <Button asChild className="h-12 w-full rounded-full bg-gradient-to-r from-[#155EEF] via-[#4338FF] to-[#D000B8]"><Link href="/briefing">Continuar para o briefing <ArrowRight /></Link></Button> : null}
  </div>

  return <div className="space-y-7 py-4 text-center">
    <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#596BFF]/40 bg-[#4338FF]/15 shadow-[0_0_50px_rgba(67,56,255,.25)]"><CheckCircle2 className="h-10 w-10 text-[#9AA8FF]" /></div>
    <div><p className="text-xs font-semibold uppercase tracking-[.22em] text-[#8EA8FF]">{confirmed ? "Pagamento confirmado" : "Pagamento enviado"}</p><h3 className="mt-3 text-3xl font-semibold tracking-[-.03em]">{confirmed ? "Tudo certo com seu pedido." : "Seu pedido foi criado."}</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/52">{confirmed ? "A confirmação foi recebida e você já pode continuar." : "Estamos aguardando a confirmação financeira enviada pelo Asaas."}</p></div>
    <div className={`flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm ${confirmed ? "border-[#596BFF]/40 bg-[#4338FF]/15 text-[#C9CEFF]" : terminal ? "border-pink-400/25 bg-pink-400/[.07] text-pink-200" : "border-white/10 bg-white/[.035] text-white/55"}`}>{confirmed ? <CheckCircle2 className="h-4 w-4" /> : terminal ? <LockKeyhole className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}{statusMessage}</div>
    {confirmed ? <Button asChild className="h-12 w-full rounded-full bg-gradient-to-r from-[#155EEF] via-[#4338FF] to-[#D000B8]"><Link href="/briefing">Preencher briefing <ArrowRight /></Link></Button> : null}
  </div>
}

export function CheckoutForm({ offer }: { offer: Offer }) {
  const form = useForm<Values>({ resolver: zodResolver(checkoutSchema), defaultValues: { billing_type: "PIX", cardholder_same_as_customer: true, installment_count: 1, customer: { country: "BR", city_code: "" } } })
  const { register, handleSubmit, watch, getValues, setValue, resetField, unregister, formState: { errors, isSubmitting } } = form
  const billingType = watch("billing_type")
  const sameCardholder = watch("cardholder_same_as_customer")
  const [loadingPostal, setLoadingPostal] = useState<PersonPrefix | null>(null)
  const [result, setResult] = useState<CheckoutResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const idempotencyKey = useRef<string | null>(null)
  const postalLookups = useRef<Record<PersonPrefix, string | null>>({ customer: null, cardholder: null })
  const maximumInstallments = offer.cycle === "YEARLY" ? 12 : offer.cycle === "SEMIANNUALLY" ? 6 : 1

  useEffect(() => {
    if (billingType === "PIX") {
      unregister("credit_card")
      unregister("cardholder")
      setValue("cardholder_same_as_customer", true)
      setValue("installment_count", 1)
    } else if (sameCardholder) {
      unregister("cardholder")
    }
  }, [billingType, sameCardholder, setValue, unregister])

  async function lookupPostalCode(prefix: PersonPrefix, value?: string) {
    const postalCode = String(value ?? getValues(`${prefix}.postal_code` as FieldPath<Values>) ?? "").replace(/\D/g, "")
    if (postalCode.length !== 8) {
      postalLookups.current[prefix] = null
      return
    }
    if (postalLookups.current[prefix] === postalCode) return
    postalLookups.current[prefix] = postalCode
    setLoadingPostal(prefix)
    try {
      const response = await fetch(`/api/postal-code/${postalCode}`)
      const data = await response.json() as AddressData | { error?: unknown }
      if (!response.ok || !("city_code" in data)) throw new Error()
      const currentPostalCode = String(getValues(`${prefix}.postal_code` as FieldPath<Values>) ?? "").replace(/\D/g, "")
      if (currentPostalCode !== postalCode) return
      for (const [field, value] of Object.entries(data as AddressData)) setValue(`${prefix}.${field}` as FieldPath<Values>, value, { shouldValidate: true })
    } catch {
      const currentPostalCode = String(getValues(`${prefix}.postal_code` as FieldPath<Values>) ?? "").replace(/\D/g, "")
      if (currentPostalCode !== postalCode) return
      postalLookups.current[prefix] = null
      setValue(`${prefix}.city_code` as FieldPath<Values>, "", { shouldValidate: true })
      toast.error("Não foi possível consultar esse CEP. Confira e tente novamente.")
    } finally { setLoadingPostal((current) => current === prefix ? null : current) }
  }

  function phoneField(name: "customer.phone" | "cardholder.phone") {
    const registration = register(name)
    const normalize = (event: React.FormEvent<HTMLInputElement>) => {
      const normalized = normalizeBrazilianPhone(event.currentTarget.value)
      event.currentTarget.value = normalized
      setValue(name, normalized, { shouldDirty: true, shouldValidate: normalized.length >= 10 })
    }
    return {
      ...registration,
      onInput: normalize,
      onAnimationStart: (event: React.AnimationEvent<HTMLInputElement>) => {
        if (event.animationName === "omi-autofill-start") normalize(event)
      },
      onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
        normalize(event)
        registration.onBlur(event)
      },
    }
  }

  async function submit(values: Values) {
    setSubmitError(null)
    try {
      idempotencyKey.current ??= crypto.randomUUID()
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey.current,
        },
        body: JSON.stringify({ ...values, offer: offer.slug }),
      })
      const data = await response.json().catch(() => ({ error: { status: response.status, code: "INVALID_RESPONSE", details: { message: "A rota retornou uma resposta inválida." } } }))
      if (!response.ok) {
        const message = formatApiError(response.status, data)
        setSubmitError(message)
        return void toast.error(message)
      }
      if (values.billing_type === "PIX" && !data.pix?.payload) {
        const message = "Erro 502 · O Asaas não retornou o QR Code Pix."
        setSubmitError(message)
        return void toast.error(message)
      }
      resetField("credit_card")
      void trackAnalyticsEvent("initiate_checkout", {
        value: Number(offer.price),
        currency: "BRL",
        content_ids: [offer.slug],
        content_type: "product",
      })
      setResult({
        ...(data as CheckoutResult),
        value: Number(offer.price),
        currency: "BRL",
        content_id: offer.slug,
      })
    } catch {
      const message = "Erro de conexão: não foi possível processar o pagamento. Não tente novamente antes de conferir seu pedido."
      setSubmitError(message)
      toast.error(message)
    }
  }

  function invalid(validationErrors: FieldErrors<Values>) {
    const fieldMessage = firstValidationMessage(validationErrors)
    const message = fieldMessage
      ? `${fieldMessage}. Revise os campos destacados.`
      : "Revise os campos destacados antes de finalizar o pagamento."
    setSubmitError(message)
    toast.error(message)
  }

  if (result) return <PaymentResult result={result} />

  return <form onSubmit={handleSubmit(submit, invalid)} className="space-y-6" autoComplete="on">
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="customer.name">Nome completo</Label><Input id="customer.name" autoComplete="name" placeholder="Como devemos chamar você?" className={inputClass} {...register("customer.name")} /><Message>{errors.customer?.name?.message}</Message></div>
      <div className="space-y-2"><Label htmlFor="customer.email">E-mail</Label><Input id="customer.email" autoComplete="email" type="email" placeholder="voce@empresa.com" className={inputClass} {...register("customer.email")} /><Message>{errors.customer?.email?.message}</Message></div>
      <div className="space-y-2"><Label htmlFor="customer.phone">Telefone</Label><Input id="customer.phone" autoComplete="tel-national" type="tel" inputMode="tel" placeholder="(71) 99999-9999" className={inputClass} {...phoneField("customer.phone")} /><Message>{errors.customer?.phone?.message}</Message></div>
      <div className="space-y-2"><Label htmlFor="customer.cpf_cnpj">CPF ou CNPJ</Label><Input id="customer.cpf_cnpj" inputMode="numeric" placeholder="Somente números ou formatado" className={inputClass} {...register("customer.cpf_cnpj")} /><Message>{errors.customer?.cpf_cnpj?.message}</Message></div>
      <div className="space-y-2 md:col-span-2"><Label htmlFor="customer.company">Empresa (opcional)</Label><Input id="customer.company" autoComplete="organization" placeholder="Nome da sua empresa" className={inputClass} {...register("customer.company")} /></div>
    </div>
    <AddressFields prefix="customer" form={form} loading={loadingPostal === "customer"} lookup={lookupPostalCode} />

    <fieldset className="space-y-3"><legend className="text-sm font-medium text-white/80">Forma de pagamento</legend><div className="grid gap-3 sm:grid-cols-2">
      {([{ value: "PIX", label: "Pix", icon: QrCode }, { value: "CREDIT_CARD", label: "Cartão de crédito", icon: CreditCard }] as const).map(({ value, label, icon: Icon }) => <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${billingType === value ? "border-[#596BFF] bg-[#4338FF]/15 shadow-[0_0_24px_rgba(67,56,255,.12)]" : "border-white/10 bg-white/[.025] hover:border-white/20"}`}><input type="radio" value={value} className="sr-only" {...register("billing_type")} onChange={(event) => { register("billing_type").onChange(event); setValue("installment_count", 1) }} /><Icon className="h-5 w-5 text-[#9AA8FF]" /><span className="font-medium">{label}</span></label>)}
    </div></fieldset>

    {billingType === "CREDIT_CARD" ? <div className="space-y-5 rounded-xl border border-[#4338FF]/30 bg-[#4338FF]/[.07] p-4 md:p-5">
      <div className="flex items-center justify-between gap-4"><div><p className="font-medium">Dados do cartão</p><p className="mt-1 text-xs text-white/45">Processamento seguro realizado pelo Asaas.</p></div><ShieldCheck className="h-6 w-6 text-[#8EA8FF]" /></div>
      <div className="space-y-2"><Label htmlFor="credit_card.number">Número do cartão</Label><Controller control={form.control} name="credit_card.number" render={({ field }) => <Input id="credit_card.number" ref={field.ref} name={field.name} value={field.value ?? ""} onBlur={field.onBlur} autoComplete="cc-number" inputMode="numeric" maxLength={23} placeholder="0000 0000 0000 0000" className={`${inputClass} font-mono tracking-[.08em]`} onChange={(event) => { const input = event.currentTarget; const digitsBeforeCaret = input.value.slice(0, input.selectionStart ?? input.value.length).replace(/\D/g, "").length; const formatted = formatCreditCardNumber(input.value); field.onChange(formatted); requestAnimationFrame(() => { const position = caretPositionForDigits(formatted, digitsBeforeCaret); input.setSelectionRange(position, position) }) }} />} /><Message>{errors.credit_card?.number?.message}</Message></div>
      <div className="space-y-2"><Label htmlFor="credit_card.holder_name">Nome impresso no cartão</Label><Input id="credit_card.holder_name" autoComplete="cc-name" placeholder="NOME COMO ESTÁ NO CARTÃO" className={inputClass} {...register("credit_card.holder_name")} /><Message>{errors.credit_card?.holder_name?.message}</Message></div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2"><Label htmlFor="credit_card.expiry_month">Mês</Label><Input id="credit_card.expiry_month" autoComplete="cc-exp-month" inputMode="numeric" maxLength={2} placeholder="MM" className={inputClass} {...register("credit_card.expiry_month")} /><Message>{errors.credit_card?.expiry_month?.message}</Message></div>
        <div className="space-y-2"><Label htmlFor="credit_card.expiry_year">Ano</Label><Input id="credit_card.expiry_year" autoComplete="cc-exp-year" inputMode="numeric" maxLength={4} placeholder="AAAA" className={inputClass} {...register("credit_card.expiry_year")} /><Message>{errors.credit_card?.expiry_year?.message}</Message></div>
        <div className="space-y-2"><Label htmlFor="credit_card.ccv">CVV</Label><Input id="credit_card.ccv" autoComplete="cc-csc" inputMode="numeric" maxLength={4} type="password" placeholder="123" className={inputClass} {...register("credit_card.ccv")} /><Message>{errors.credit_card?.ccv?.message}</Message></div>
      </div>
      {maximumInstallments > 1 ? <div className="space-y-2"><Label htmlFor="installment_count">Parcelamento</Label><select id="installment_count" className={`${inputClass} w-full rounded-md px-3`} {...register("installment_count")}>{Array.from({ length: maximumInstallments }, (_, index) => index + 1).map((count) => <option key={count} value={count} className="bg-[#07143D]">{count}x de {formatMoney(Number(offer.price) / count)}</option>)}</select></div> : null}
      <label className="flex cursor-pointer items-start gap-3 border-t border-white/10 pt-5 text-sm text-white/78"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#4338FF]" {...register("cardholder_same_as_customer")} /><span>Dados do proprietário do cartão são os mesmos acima</span></label>
      {!sameCardholder ? <div className="space-y-5 border-t border-white/10 pt-5">
        <div><p className="font-medium">Dados do proprietário do cartão</p><p className="mt-1 text-xs text-white/45">Use os dados vinculados ao cartão para evitar recusas.</p></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="cardholder.name">Nome completo</Label><Input id="cardholder.name" className={inputClass} {...register("cardholder.name")} /><Message>{errors.cardholder?.name?.message}</Message></div>
          <div className="space-y-2"><Label htmlFor="cardholder.email">E-mail</Label><Input id="cardholder.email" type="email" className={inputClass} {...register("cardholder.email")} /><Message>{errors.cardholder?.email?.message}</Message></div>
          <div className="space-y-2"><Label htmlFor="cardholder.phone">Telefone</Label><Input id="cardholder.phone" autoComplete="tel-national" type="tel" inputMode="tel" className={inputClass} {...phoneField("cardholder.phone")} /><Message>{errors.cardholder?.phone?.message}</Message></div>
          <div className="space-y-2"><Label htmlFor="cardholder.cpf_cnpj">CPF ou CNPJ</Label><Input id="cardholder.cpf_cnpj" inputMode="numeric" className={inputClass} {...register("cardholder.cpf_cnpj")} /><Message>{errors.cardholder?.cpf_cnpj?.message}</Message></div>
        </div>
        <AddressFields prefix="cardholder" form={form} loading={loadingPostal === "cardholder"} lookup={lookupPostalCode} />
      </div> : null}
    </div> : null}

    {submitError ? <p role="alert" className="rounded-xl border border-pink-400/25 bg-pink-400/[.07] px-4 py-3 text-sm text-pink-200">{submitError}</p> : null}
    <Button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-full bg-gradient-to-r from-[#155EEF] via-[#4338FF] to-[#D000B8] text-white hover:brightness-110">{isSubmitting ? <><Loader2 className="animate-spin" />Processando com segurança</> : <>Finalizar pagamento <ArrowRight /></>}</Button>
    <p className="flex items-center justify-center gap-2 text-xs text-white/38"><LockKeyhole className="h-3.5 w-3.5" />Seus dados de cartão não são armazenados pela Omi.</p>
  </form>
}
