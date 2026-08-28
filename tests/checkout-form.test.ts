import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { createElement } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { CheckoutForm, checkoutSchema, formatCreditCardNumber, PaymentResult } from "@/components/checkout-form"

const replace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}))

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  replace.mockReset()
})

describe("formatCreditCardNumber", () => {
  it("separa o número do cartão em grupos de quatro dígitos", () => {
    expect(formatCreditCardNumber("4111111111111111")).toBe("4111 1111 1111 1111")
  })

  it("aceita colagem formatada, remove outros caracteres e limita a 19 dígitos", () => {
    expect(formatCreditCardNumber("4111-1111 1111.1111abc99999")).toBe(
      "4111 1111 1111 1111 999",
    )
  })
})

describe("checkoutSchema", () => {
  it("aceita checkout Pix sem campos de cartão", () => {
    const result = checkoutSchema.safeParse({
      billing_type: "PIX",
      cardholder_same_as_customer: true,
      installment_count: 1,
      customer: {
        name: "Maria Cliente",
        email: "maria@example.com",
        phone: "71999999999",
        cpf_cnpj: "12345678901",
        postal_code: "40020-000",
        street: "Rua Chile",
        address_number: "10",
        address_complement: "",
        neighborhood: "Centro",
        city: "Salvador",
        city_code: "2927408",
        state: "BA",
        country: "BR",
      },
    })

    expect(result.success).toBe(true)
  })
})

describe("CheckoutForm", () => {
  it("envia o formulário de cartão válido para a rota interna de checkout", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      if (String(input).startsWith("/api/postal-code/")) {
        return new Response(JSON.stringify({
          postal_code: "40020000", street: "Rua Chile", address_complement: "",
          neighborhood: "Centro", city: "Salvador", city_code: "2927408", state: "BA", country: "BR",
        }), { status: 200, headers: { "Content-Type": "application/json" } })
      }
      return new Response(JSON.stringify({
        resource_type: "order", id: "order-1", status: "PAID",
        billing_type: "CREDIT_CARD", payment_status: "CONFIRMED", payment_id: "pay-1",
      }), { status: 201, headers: { "Content-Type": "application/json" } })
    })

    render(createElement(CheckoutForm, { offer: { slug: "plano-anual", cycle: "YEARLY", price: "1200.00" } }))

    const fill = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
    fill("Nome completo", "Maria Cliente")
    fill("E-mail", "maria@example.com")
    fill("Telefone", "71999999999")
    fill("CPF ou CNPJ", "24971563792")
    fill("CEP", "40020000")
    fill("Rua", "Rua Chile")
    fill("Número", "10")
    fill("Bairro", "Centro")
    fill("Cidade", "Salvador")
    fill("Estado", "BA")
    fireEvent.blur(screen.getByLabelText("CEP"))
    await waitFor(() => expect((document.querySelector('input[name="customer.city_code"]') as HTMLInputElement).value).toBe("2927408"))

    fireEvent.click(screen.getByLabelText("Cartão de crédito"))
    fill("Número do cartão", "4444444444444444")
    fill("Nome impresso no cartão", "MARIA CLIENTE")
    fill("Mês", "12")
    fill("Ano", "2030")
    fill("CVV", "123")
    fireEvent.click(screen.getByRole("button", { name: /finalizar pagamento/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/checkout", expect.objectContaining({ method: "POST" })))
    const checkoutCall = fetchMock.mock.calls.find(([input]) => input === "/api/checkout")!
    const request = checkoutCall[1] as RequestInit
    const payload = JSON.parse(String(request.body))
    expect(payload.billing_type).toBe("CREDIT_CARD")
    expect(payload.credit_card.number).toBe("4444 4444 4444 4444")
    expect(payload.offer).toBe("plano-anual")
  })
})

describe("PaymentResult", () => {
  it("consulta o status a cada 3 segundos e abre o briefing após confirmação", async () => {
    vi.useFakeTimers()
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({
        resource_type: "order",
        status: "PENDING_PAYMENT",
        payment_status: "PENDING",
        confirmed: false,
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        resource_type: "order",
        status: "PAID",
        payment_status: "RECEIVED",
        confirmed: true,
      }), { status: 200, headers: { "Content-Type": "application/json" } }))

    render(createElement(PaymentResult, { result: {
      resource_type: "order",
      id: "order-1",
      status: "PENDING_PAYMENT",
      billing_type: "CREDIT_CARD",
      payment_status: "CONFIRMED",
    } }))

    expect(screen.queryByRole("link", { name: /briefing/i })).toBeNull()
    await act(async () => vi.advanceTimersByTimeAsync(3000))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("link", { name: /briefing/i })).toBeNull()

    await act(async () => vi.advanceTimersByTimeAsync(3000))
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(replace).toHaveBeenCalledWith("/briefing")
    expect(screen.getByRole("link", { name: /briefing/i })).toBeInTheDocument()
  })
})
