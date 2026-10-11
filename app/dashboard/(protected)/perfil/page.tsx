import type { Metadata } from "next"

import { ProfileSettings } from "@/components/dashboard/profile-settings"

export const metadata: Metadata = { title: "Meu perfil | Omi Backoffice" }

type ProfilePageProps = {
  searchParams: Promise<{ google?: string }>
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const { google } = await searchParams
  const googleResult = ["connected", "denied", "error"].includes(google ?? "")
    ? google
    : undefined

  return <ProfileSettings googleResult={googleResult} />
}
