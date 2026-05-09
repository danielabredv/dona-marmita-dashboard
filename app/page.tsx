"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/ui/Sidebar"
import { supabase } from "@/lib/supabase"

export default function FinanceiroPage() {

  const [valorReal, setValorReal] = useState("")
  const [observacao, setObservacao] = useState("")

  const [vendas, setVendas] = useState<any[]>([])
  const [fechamentos, setFechamentos] = useState<any[]>([])

  // BUSCAR VENDAS

  async function buscarVendas() {

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("vendas")
      .select("*")
      .eq("user_id", user.id)

    setVendas(data || [])
  }

  // BUSCAR FECHAMENTOS

  async function buscarFechamentos() {

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("fechamentos")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false })

    setFechamentos(data || [])
  }

  // SALVAR FECHAMENTO

  async function salvarFechamento() {

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from("fechamentos")
      .insert([
        {
          valor_real: Number(valorReal),
          observacao,
          user_id: user.id
        }
      ])

    setValorReal("")
    setObservacao("")

    buscarFechamentos()
  }

  useEffect(() => {

    buscarVendas()
    buscarFechamentos()

  }, [])

  // DATA HOJE

  const hoje = new Date()
    .toLocaleDateString("pt-BR")

  // VENDAS DE HOJE

  const vendasHoje = vendas.filter((venda) => {

    const dataVenda = new Date(
      venda.created_at
    ).toLocaleDateString("pt-BR")

    return dataVenda === hoje
  })

  // TOTAL SISTEMA

  const totalSistemaHoje = vendasHoje.reduce(
    (total, venda) =>
      total + Number(venda.valor),
    0
  )

  // FECHAMENTO DE HOJE

  const fechamentoHoje = fechamentos.find((item) => {

    const dataFechamento = new Date(
      item.created_at
    ).toLocaleDateString("pt-BR")

    return dataFechamento === hoje
  })

  const valorFechamento =
    fechamentoHoje?.valor_real || 0

  // DIFERENÇA

  const diferenca =
    valorFechamento - totalSistemaHoje

  // DATA DE ONTEM

  const ontem = new Date()

  ontem.setDate(ontem.getDate() - 1)

  const dataOntem =
    ontem.toLocaleDateString("pt-BR")

  // FECHAMENTO HOJE

  const fechamentoAtualObj =
    fechamentos.find((item) => {

      const data = new Date(
        item.created_at
      ).toLocaleDateString("pt-BR")

      return data === hoje
    })

  // FECHAMENTO ONTEM

  const fechamentoOntemObj =
    fechamentos.find((item) => {

      const data = new Date(
        item.created_at
      ).toLocaleDateString("pt-BR")

      return data === dataOntem
    })

  const fechamentoAtual =
    fechamentoAtualObj?.valor_real || 0

  const fechamentoOntem =
    fechamentoOntemObj?.valor_real || 0

  // CRESCIMENTO %

  const crescimento =
    fechamentoOntem > 0
      ? (
          (
            (fechamentoAtual - fechamentoOntem)
            / fechamentoOntem
          ) * 100
        ).toFixed(1)
      : 0

  return (

    <div className="flex min-h-screen bg-zinc-100">

      <Sidebar />

      <main className="flex-1 p-10">

        <h1 className="text-4xl font-bold mb-8">
          Central Financeira
        </h1>

        {/* CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">

          {/* SISTEMA */}

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <p className="text-gray-500 mb-2">
              Sistema Hoje
            </p>

            <h2 className="text-4xl font-bold">
              R$ {totalSistemaHoje}
            </h2>

          </div>

          {/* FECHAMENTO */}

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <p className="text-gray-500 mb-2">
              Fechamento Real
            </p>

            <h2 className="text-4xl font-bold text-green-600">
              R$ {valorFechamento}
            </h2>

          </div>

          {/* DIFERENÇA */}

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <p className="text-gray-500 mb-2">
              Diferença
            </p>

            <h2
              className={`text-4xl font-bold ${
                diferenca >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              R$ {diferenca}
            </h2>

          </div>

          {/* CRESCIMENTO */}

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <p className="text-gray-500 mb-2">
              Crescimento
            </p>

            <h2
              className={`text-4xl font-bold ${
                Number(crescimento) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {Number(crescimento) >= 0 ? "+" : ""}
              {crescimento}%
            </h2>

          </div>

        </div>

        {/* FORMULÁRIO */}

        <div className="bg-white rounded-2xl p-6 shadow-sm max-w-xl mb-10">

          <h2 className="text-2xl font-bold mb-6">
            Fechamento do Dia
          </h2>

          <div className="flex flex-col gap-4">

            <input
              type="number"
              placeholder="Valor real do dia"
              value={valorReal}
              onChange={(e) =>
                setValorReal(e.target.value)
              }
              className="border p-3 rounded-xl"
            />

            <textarea
              placeholder="Observação"
              value={observacao}
              onChange={(e) =>
                setObservacao(e.target.value)
              }
              className="border p-3 rounded-xl"
            />

            <button
              onClick={salvarFechamento}
              className="bg-black text-white p-3 rounded-xl"
            >
              Salvar Fechamento
            </button>

          </div>

        </div>

      </main>

    </div>
  )
}