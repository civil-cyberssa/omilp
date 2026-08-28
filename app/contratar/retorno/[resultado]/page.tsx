import { redirect } from "next/navigation"

const allowedResults = new Set(["sucesso", "cancelado", "expirado"])

export default async function CheckoutResultPage({
  params,
}: {
  params: Promise<{ resultado: string }>
}) {
  const { resultado } = await params
  const safeResult = allowedResults.has(resultado) ? resultado : "cancelado"
  redirect(`/contratar/retorno?resultado=${safeResult}`)
}
