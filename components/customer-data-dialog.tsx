"use client"

import { Loader2, UserRound } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiErrorMessage, type PortalCustomer } from "@/lib/portal"

type CustomerDataDialogProps = {
  customer: PortalCustomer
  onSaved: (customer: PortalCustomer) => void
}

export function CustomerDataDialog({ customer, onSaved }: CustomerDataDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) setError("")
  }

  async function submit(formData: FormData) {
    setLoading(true)
    setError("")
    const response = await fetch("/api/portal/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        company: formData.get("company"),
      }),
    })
    const data = await response.json().catch(() => ({}))
    setLoading(false)
    if (!response.ok) {
      setError(apiErrorMessage(data, "Não foi possível atualizar seus dados."))
      return
    }
    onSaved(data as PortalCustomer)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-white/15 bg-white/[.035] text-white hover:bg-white/10 hover:text-white"
        >
          <UserRound />
          Meus dados
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/15 bg-[#07112d] text-white shadow-2xl shadow-black/50 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Meus dados</DialogTitle>
          <DialogDescription className="text-white/50">
            Mantenha seus contatos atualizados para falarmos sobre o projeto.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="mt-3 grid gap-5 sm:grid-cols-2">
          <ContactField name="name" label="Nome" defaultValue={customer.name} required />
          <ContactField name="company" label="Empresa" defaultValue={customer.company} />
          <div className="sm:col-span-2">
            <ContactField
              name="email"
              label="E-mail"
              type="email"
              defaultValue={customer.email}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <ContactField
              name="phone"
              label="Telefone com DDD"
              type="tel"
              defaultValue={customer.phone}
              placeholder="(71) 99999-9999"
            />
          </div>
          {error ? <p role="alert" className="text-sm text-pink-300 sm:col-span-2">{error}</p> : null}
          <Button
            type="submit"
            disabled={loading}
            className="h-11 rounded-full bg-gradient-to-r from-[#155EEF] via-[#4338FF] to-[#D000B8] sm:col-span-2"
          >
            {loading ? <><Loader2 className="animate-spin" />Salvando</> : "Salvar meus dados"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ContactField({
  name,
  label,
  type = "text",
  defaultValue,
  placeholder,
  required = false,
}: {
  name: string
  label: string
  type?: string
  defaultValue: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`customer-${name}`}>{label}</Label>
      <Input
        id={`customer-${name}`}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="h-11 border-white/15 bg-white/[.04] text-white placeholder:text-white/30"
      />
    </div>
  )
}
