"use client"

import {
  CalendarCheck2,
  Check,
  ExternalLink,
  KeyRound,
  Link2,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  Unlink,
  UserRound,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { type FormEvent, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  type AuthUser,
  type GoogleCalendarStatus,
  type GoogleCalendarSyncResult,
  dashboardFetcher,
  dashboardMutation,
  formatDashboardDateTime,
} from "@/lib/dashboard-api"

type ProfileSettingsProps = {
  googleResult?: string
}

type ProfileForm = Pick<AuthUser, "email" | "first_name" | "last_name" | "phone">

const emptyProfile: ProfileForm = {
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
}

export function ProfileSettings({ googleResult }: ProfileSettingsProps) {
  const router = useRouter()
  const resultHandled = useRef(false)
  const { data: user, error: userError, mutate: mutateUser } = useSWR<AuthUser>(
    "/api/backoffice/me",
    dashboardFetcher,
  )
  const {
    data: googleStatus,
    error: googleError,
    mutate: mutateGoogleStatus,
  } = useSWR<GoogleCalendarStatus>(
    "/api/backoffice/calendar/google/status",
    dashboardFetcher,
  )
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile)
  const [profileReady, setProfileReady] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  })

  useEffect(() => {
    if (!user || profileReady) return
    setProfile({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone ?? "",
    })
    setProfileReady(true)
  }, [profileReady, user])

  useEffect(() => {
    if (!googleResult || resultHandled.current) return
    resultHandled.current = true
    if (googleResult === "connected") {
      toast.success("Google Calendar conectado e sincronizado.")
      void mutateGoogleStatus()
      router.replace("/dashboard/perfil")
      return
    }
    if (googleResult === "denied") {
      toast.info("A autorização do Google foi cancelada.")
    } else {
      toast.error("Não foi possível conectar o Google Calendar.")
    }
    router.replace("/dashboard/perfil")
  }, [googleResult, mutateGoogleStatus, router])

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingProfile(true)
    try {
      const updated = await dashboardMutation<AuthUser>("/api/backoffice/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      await mutateUser(updated, { revalidate: false })
      toast.success("Informações pessoais atualizadas.")
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível salvar o perfil.")
    } finally {
      setSavingProfile(false)
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingPassword(true)
    try {
      await dashboardMutation<void>("/api/backoffice/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwords),
      })
      toast.success("Senha alterada. Entre novamente para continuar.")
      await signOut({ redirect: false })
      router.replace("/dashboard/login")
      router.refresh()
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível alterar a senha.")
      setSavingPassword(false)
    }
  }

  async function connectGoogle() {
    setConnecting(true)
    try {
      const result = await dashboardMutation<{ authorization_url: string }>(
        "/api/backoffice/calendar/google/authorization",
        { method: "POST" },
      )
      window.location.assign(result.authorization_url)
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível iniciar a conexão.")
      setConnecting(false)
    }
  }

  async function syncGoogle() {
    setSyncing(true)
    try {
      const result = await dashboardMutation<GoogleCalendarSyncResult>(
        "/api/backoffice/calendar/google/sync",
        { method: "POST" },
      )
      await mutateGoogleStatus()
      const changed = result.imported + result.updated + result.deleted + result.exported
      toast.success(
        changed === 0
          ? "Agenda atualizada. Nenhuma mudança nova."
          : `Agenda atualizada com ${changed} ${changed === 1 ? "mudança" : "mudanças"}.`,
      )
      if (result.failed > 0) toast.warning(`${result.failed} evento(s) continuam pendentes.`)
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível sincronizar a agenda.")
    } finally {
      setSyncing(false)
    }
  }

  async function disconnectGoogle() {
    setDisconnecting(true)
    try {
      await dashboardMutation<void>("/api/backoffice/calendar/google/connection", {
        method: "DELETE",
      })
      await mutateGoogleStatus()
      toast.success("Google Calendar desconectado.")
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível desconectar.")
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-[#4338FF]/10 bg-[#020617] px-6 py-8 text-white shadow-[0_28px_80px_rgba(2,6,23,.18)] sm:px-9">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(21,94,239,.42),transparent_34%),radial-gradient(circle_at_94%_100%,rgba(208,0,184,.26),transparent_38%)]" />
        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.07] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
              <ShieldCheck className="h-3.5 w-3.5 text-[#7DA8FF]" /> Conta e integrações
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Meu perfil</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
              Mantenha seus dados de acesso atualizados e conecte sua agenda de trabalho.
            </p>
          </div>
          {user ? (
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 backdrop-blur">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#155EEF] to-[#D000B8] text-sm font-semibold">
                {(user.first_name || user.email).slice(0, 1).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-white/45">{user.email}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1.08fr_.92fr]">
        <Card className="border-[#4338FF]/10 shadow-[0_18px_55px_rgba(67,56,255,.07)]">
          <CardHeader className="border-b bg-gradient-to-r from-[#155EEF]/[.045] to-transparent">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-[#155EEF]/10 p-2.5 text-[#155EEF]"><UserRound className="h-5 w-5" /></span>
              <div><CardTitle className="text-lg">Informações pessoais</CardTitle><p className="mt-1 text-sm text-muted-foreground">Dados exibidos no backoffice e usados no acesso.</p></div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {userError ? <p className="text-sm text-destructive">Não foi possível carregar seu perfil.</p> : !user ? <div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div> : (
              <form className="space-y-5" onSubmit={updateProfile}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="first-name">Nome</Label><Input id="first-name" autoComplete="given-name" value={profile.first_name} onChange={(event) => setProfile((current) => ({ ...current, first_name: event.target.value }))} maxLength={150} /></div>
                  <div className="space-y-2"><Label htmlFor="last-name">Sobrenome</Label><Input id="last-name" autoComplete="family-name" value={profile.last_name} onChange={(event) => setProfile((current) => ({ ...current, last_name: event.target.value }))} maxLength={150} /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="profile-email">E-mail de acesso</Label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="profile-email" className="pl-9" type="email" autoComplete="email" required value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} /></div></div>
                <div className="space-y-2"><Label htmlFor="profile-phone">Telefone</Label><Input id="profile-phone" type="tel" autoComplete="tel" placeholder="(71) 99999-9999" value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} maxLength={20} /></div>
                <div className="flex justify-end border-t pt-5"><Button type="submit" disabled={savingProfile}>{savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}Salvar alterações</Button></div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-[#4285F4]/20 shadow-[0_18px_55px_rgba(66,133,244,.09)]">
          <CardHeader className="border-b bg-[linear-gradient(110deg,rgba(66,133,244,.08),rgba(52,168,83,.04),rgba(251,188,5,.04),rgba(234,67,53,.05))]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3"><span className="rounded-xl bg-white p-2.5 text-[#4285F4] shadow-sm ring-1 ring-black/5"><CalendarCheck2 className="h-5 w-5" /></span><div><CardTitle className="text-lg">Google Calendar</CardTitle><p className="mt-1 text-sm text-muted-foreground">Sincronização bidirecional da sua agenda.</p></div></div>
              {googleStatus?.connected ? <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"><span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />Conectado</Badge> : null}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {googleError ? <p className="text-sm text-destructive">Não foi possível consultar a integração.</p> : !googleStatus ? <div className="space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-10 w-full" /></div> : googleStatus.connected ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4"><div className="flex items-start gap-3"><span className="mt-0.5 rounded-full bg-emerald-100 p-1.5 text-emerald-700"><Check className="h-3.5 w-3.5" /></span><div><p className="text-sm font-semibold text-emerald-950">{googleStatus.calendar_name || "Agenda principal"}</p><p className="mt-1 text-xs leading-5 text-emerald-800/70">Eventos criados aqui são enviados ao Google. Alterações feitas no Google entram na próxima sincronização.</p></div></div></div>
                <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground"><span>Última sincronização</span><span className="font-medium text-foreground">{formatDashboardDateTime(googleStatus.last_synced_at)}</span></div>
                <div className="grid gap-2 sm:grid-cols-2"><Button type="button" onClick={syncGoogle} disabled={syncing}>{syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}Sincronizar agora</Button><AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="outline" className="text-destructive hover:text-destructive"><Unlink className="mr-2 h-4 w-4" />Desconectar</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Desconectar o Google Calendar?</AlertDialogTitle><AlertDialogDescription>Os eventos já importados permanecem na Omi, mas novas alterações deixam de ser sincronizadas.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Manter conectado</AlertDialogCancel><AlertDialogAction onClick={disconnectGoogle} disabled={disconnecting}>{disconnecting ? "Desconectando…" : "Desconectar"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>
              </div>
            ) : (
              <div className="space-y-5"><div className="rounded-2xl border bg-muted/35 p-4"><div className="flex items-start gap-3"><Link2 className="mt-0.5 h-5 w-5 text-[#4285F4]" /><div><p className="text-sm font-semibold">Conecte seu e-mail Google</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Você escolherá a conta no Google e autorizará somente o acesso aos eventos da agenda.</p></div></div></div><Button type="button" className="w-full bg-[#155EEF] hover:bg-[#155EEF]/90" onClick={connectGoogle} disabled={connecting || !googleStatus.configured}>{connecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}{googleStatus.configured ? "Conectar com Google" : "Integração indisponível"}</Button>{!googleStatus.configured ? <p className="text-center text-xs text-amber-700">As credenciais do Google ainda não foram configuradas no servidor.</p> : null}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#D000B8]/10 shadow-[0_18px_55px_rgba(208,0,184,.05)]">
        <CardHeader className="border-b bg-gradient-to-r from-[#D000B8]/[.035] to-transparent"><div className="flex items-center gap-3"><span className="rounded-xl bg-[#D000B8]/10 p-2.5 text-[#A0008E]"><KeyRound className="h-5 w-5" /></span><div><CardTitle className="text-lg">Segurança</CardTitle><p className="mt-1 text-sm text-muted-foreground">Ao alterar a senha, todas as sessões ativas serão encerradas.</p></div></div></CardHeader>
        <CardContent className="p-6"><form className="grid gap-5 lg:grid-cols-3 lg:items-end" onSubmit={updatePassword}><div className="space-y-2"><Label htmlFor="current-password">Senha atual</Label><Input id="current-password" type="password" autoComplete="current-password" required value={passwords.current_password} onChange={(event) => setPasswords((current) => ({ ...current, current_password: event.target.value }))} /></div><div className="space-y-2"><Label htmlFor="new-password">Nova senha</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={12} required value={passwords.new_password} onChange={(event) => setPasswords((current) => ({ ...current, new_password: event.target.value }))} /><p className="text-[11px] text-muted-foreground">Use ao menos 12 caracteres.</p></div><div className="space-y-2"><Label htmlFor="confirm-password">Confirmar nova senha</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={12} required value={passwords.new_password_confirmation} onChange={(event) => setPasswords((current) => ({ ...current, new_password_confirmation: event.target.value }))} /></div><div className="lg:col-span-3 flex justify-end border-t pt-5"><Button type="submit" variant="outline" disabled={savingPassword}>{savingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}Alterar senha</Button></div></form></CardContent>
      </Card>
    </div>
  )
}
