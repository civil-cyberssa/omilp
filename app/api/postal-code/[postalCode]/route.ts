import { NextResponse } from "next/server"

import { apiError, withRouteErrorHandling } from "@/lib/api-response"

type ViaCepResponse = {
  cep?: string
  logradouro?: string
  complemento?: string
  bairro?: string
  localidade?: string
  uf?: string
  ibge?: string
  erro?: boolean | string
}

export async function GET(_request: Request, { params }: { params: Promise<{ postalCode: string }> }) {
  return withRouteErrorHandling("GET /api/postal-code/[postalCode]", async () => {
    const postalCode = (await params).postalCode.replace(/\D/g, "")
    if (postalCode.length !== 8) return apiError(400, "INVALID_POSTAL_CODE", { message: "Informe um CEP com 8 dígitos." })

    let response: Response
    try {
      response = await fetch(`https://viacep.com.br/ws/${postalCode}/json/`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      })
    } catch {
      return apiError(502, "POSTAL_CODE_PROVIDER_UNAVAILABLE", { message: "Não foi possível consultar o ViaCEP." })
    }
    if (!response.ok) return apiError(502, "POSTAL_CODE_PROVIDER_ERROR", { message: "O ViaCEP não respondeu à consulta.", upstream_status: response.status })
    const data = await response.json() as ViaCepResponse
    if (data.erro || !data.ibge || !data.localidade || !data.uf) return apiError(404, "POSTAL_CODE_NOT_FOUND", { message: "CEP não encontrado." })

    return NextResponse.json({
      postal_code: data.cep ?? postalCode,
      street: data.logradouro ?? "",
      address_complement: data.complemento ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade,
      city_code: data.ibge,
      state: data.uf,
      country: "BR",
    })
  })
}
