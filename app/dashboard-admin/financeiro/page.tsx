"use client"

import { useEffect, useState } from "react"

import { supabase } from "@/lib/supabase"

import AdminSidebar from "@/components/ui/AdminSidebar"

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign
} from "lucide-react"

export default function FinanceiroAdminPage() {

  const [vendas, setVendas] =
    useState<any[]>([])

  const [fechamentos, setFechamentos] =
    useState<any[]>([])

  const [valorReal, setValorReal] =
    useState("")

  const [observacao, setObservacao] =
    useState("")

  // BUSCAR VENDAS

  async function buscarVendas() {

    const { data, error } =
      await supabase
        .from("vendas")
        .select("*")
        .order("created_at", {
          ascending: false
        })

    if (error) {

      console.log(error)

      return
    }

    setVendas(data || [])
  }

  // BUSCAR FECHAMENTOS

  async function buscarFechamentos() {

    const { data, error } =
      await supabase
        .from("fechamentos")
        .select("*")
        .order("created_at", {
          ascending: false
        })

    if (error) {

      console.log(error)

      return
    }

    setFechamentos(data || [])
  }

  // SALVAR FECHAMENTO

  async function salvarFechamento() {

    if (!valorReal) {

      alert("Digite o valor")

      return
    }

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from("fechamentos")
      .insert([
        {
          valor_real: Number(valorReal),
          observacao,
          user_id: user.id
        }
      ])

    if (error) {

      console.log(error)

      alert("Erro ao salvar")

      return
    }

    alert("Fechamento salvo")

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

  // VENDAS HOJE

  const vendasHoje = vendas.filter((venda) => {

    const dataVenda = new Date(
      venda.created_at
    ).toLocaleDateString("pt-BR")

    return dataVenda === hoje
  })

  // TOTAIS

  const totalSistemaHoje =
    vendasHoje.reduce(
      (total, venda) =>
        total + Number(venda.valor),
      0
    )

  const totalPago =
    vendasHoje
      .filter(
        (venda) =>
          venda.status === "Pago"
      )
      .reduce(
        (total, venda) =>
          total + Number(venda.valor),
        0
      )

  const totalPendente =
    vendasHoje
      .filter(
        (venda) =>
          venda.status === "Pendente"
      )
      .reduce(
        (total, venda) =>
          total + Number(venda.valor),
        0
      )

  // FECHAMENTO MAIS RECENTE

  const fechamentoAtual =
    fechamentos[0]?.valor_real || 0

  // DIFERENÇA

  const diferenca =
    fechamentoAtual -
    totalSistemaHoje

  // FECHAMENTO ANTERIOR

  const fechamentoOntem =
    fechamentos[1]?.valor_real || 0

  // CRESCIMENTO

  const crescimento =
    fechamentoOntem > 0
      ? (
          (
            (
              fechamentoAtual -
              fechamentoOntem
            ) /
            fechamentoOntem
          ) * 100
        ).toFixed(1)
      : "0"

  return (

    <div className="flex min-h-screen bg-[#f5f6f8]">

      {/* SIDEBAR */}

      <AdminSidebar />

      {/* CONTEÚDO */}

      <main className="flex-1 p-10">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-5xl font-bold tracking-tight">

            Financeiro Global

          </h1>

          <p className="text-zinc-500 mt-2 text-lg">

            Controle financeiro administrativo

          </p>

        </div>

        {/* CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">

          {/* FATURAMENTO */}

          <div className="bg-white rounded-3xl p-7 border border-zinc-100 shadow-sm">

            <div className="flex items-center justify-between mb-5">

              <div className="bg-black text-white p-3 rounded-2xl">

                <DollarSign size={24} />

              </div>

            </div>

            <p className="text-zinc-500 mb-2">
              Total Hoje
            </p>

            <h2 className="text-4xl font-bold">

              R$ {totalSistemaHoje}

            </h2>

          </div>

          {/* PAGOS */}

          <div className="bg-white rounded-3xl p-7 border border-zinc-100 shadow-sm">

            <div className="flex items-center justify-between mb-5">

              <div className="bg-green-500 text-white p-3 rounded-2xl">

                <TrendingUp size={24} />

              </div>

            </div>

            <p className="text-zinc-500 mb-2">
              Total Pago
            </p>

            <h2 className="text-4xl font-bold text-green-600">

              R$ {totalPago}

            </h2>

          </div>

          {/* PENDENTES */}

          <div className="bg-white rounded-3xl p-7 border border-zinc-100 shadow-sm">

            <div className="flex items-center justify-between mb-5">

              <div className="bg-yellow-500 text-white p-3 rounded-2xl">

                <TrendingDown size={24} />

              </div>

            </div>

            <p className="text-zinc-500 mb-2">
              Pendências
            </p>

            <h2 className="text-4xl font-bold text-yellow-600">

              R$ {totalPendente}

            </h2>

          </div>

          {/* CRESCIMENTO */}

          <div className="bg-white rounded-3xl p-7 border border-zinc-100 shadow-sm">

            <div className="flex items-center justify-between mb-5">

              <div className="bg-blue-500 text-white p-3 rounded-2xl">

                <Wallet size={24} />

              </div>

            </div>

            <p className="text-zinc-500 mb-2">
              Crescimento
            </p>

            <h2 className="text-4xl font-bold text-blue-600">

              {crescimento}%

            </h2>

          </div>

        </div>

        {/* GRID */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* NOVO FECHAMENTO */}

          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">

            <h2 className="text-3xl font-bold mb-8">

              Novo Fechamento

            </h2>

            <div className="flex flex-col gap-5">

              <input
                type="number"
                placeholder="Valor real"
                value={valorReal}
                onChange={(e) =>
                  setValorReal(
                    e.target.value
                  )
                }
                className="border border-zinc-200 rounded-2xl p-4 outline-none focus:border-black transition-all"
              />

              <textarea
                placeholder="Observação"
                value={observacao}
                onChange={(e) =>
                  setObservacao(
                    e.target.value
                  )
                }
                className="border border-zinc-200 rounded-2xl p-4 outline-none focus:border-black transition-all min-h-[140px]"
              />

              <button
                onClick={salvarFechamento}
                className="bg-black text-white py-4 rounded-2xl font-semibold hover:opacity-90 transition-all"
              >

                Salvar Fechamento

              </button>

            </div>

          </div>

          {/* RESUMO */}

          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">

            <h2 className="text-3xl font-bold mb-8">

              Resumo Financeiro

            </h2>

            <div className="flex flex-col gap-5">

              <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200">

                <p className="text-zinc-500 mb-2">
                  Sistema
                </p>

                <h2 className="text-3xl font-bold">

                  R$ {totalSistemaHoje}

                </h2>

              </div>

              <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200">

                <p className="text-zinc-500 mb-2">
                  Fechamento Atual
                </p>

                <h2 className="text-3xl font-bold">

                  R$ {fechamentoAtual}

                </h2>

              </div>

              <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200">

                <p className="text-zinc-500 mb-2">
                  Diferença
                </p>

                <h2
                  className={`text-3xl font-bold ${
                    diferenca >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >

                  R$ {diferenca}

                </h2>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  )
}
