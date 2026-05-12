"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { supabase } from "@/lib/supabase"
import Sidebar from "@/components/ui/AdminSidebar"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts"
import AdminSidebar from "@/components/ui/AdminSidebar"

export default function DashboardAdminPage() {

  const router = useRouter()

  const [vendas, setVendas] = useState<any[]>([])

  // BUSCAR VENDAS

  async function buscarVendas() {

    const { data, error } = await supabase
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

  // LOGOUT

  async function sair() {

    await supabase.auth.signOut()

    router.push("/login")
  }

  useEffect(() => {

    buscarVendas()

  }, [])

  // DATA DE HOJE

  const hoje = new Date()
    .toISOString()
    .split("T")[0]

  // VENDAS HOJE

  const vendasHoje = vendas.filter((venda) => {

    const dataVenda =
      venda.created_at.split("T")[0]

    return dataVenda === hoje
  })

  // CARDS

  const totalVendido = vendasHoje.reduce(
    (total, venda) =>
      total + Number(venda.valor),
    0
  )

  const totalPago = vendasHoje
    .filter((venda) =>
      venda.status === "Pago"
    )
    .reduce(
      (total, venda) =>
        total + Number(venda.valor),
      0
    )

  const totalPendente = vendasHoje
    .filter((venda) =>
      venda.status === "Pendente"
    )
    .reduce(
      (total, venda) =>
        total + Number(venda.valor),
      0
    )

  const quantidadeVendas =
    vendasHoje.length

  // RANKING VENDEDORES

  const vendedoresMap: any = {}

  vendasHoje.forEach((venda) => {

    if (!vendedoresMap[venda.vendedor]) {

      vendedoresMap[venda.vendedor] = {

        vendedor: venda.vendedor,
        total: 0,
        pedidos: 0,
        pendente: 0

      }
    }

    vendedoresMap[venda.vendedor].total +=
      Number(venda.valor)

    vendedoresMap[venda.vendedor].pedidos += 1

    if (venda.status === "Pendente") {

      vendedoresMap[venda.vendedor].pendente +=
        Number(venda.valor)
    }
  })

  const rankingVendedores =
    Object.values(vendedoresMap)
      .sort(
        (a: any, b: any) =>
          b.total - a.total
      )

  // GRÁFICO POR HORÁRIO

  const vendasPorHorario: any = {}

  vendasHoje.forEach((venda) => {

    const data = new Date(
      new Date(venda.created_at)
        .getTime() - 3 * 60 * 60 * 1000
    )

    const hora =
      data.getHours()
        .toString()
        .padStart(2, "0") + "h"

    if (!vendasPorHorario[hora]) {

      vendasPorHorario[hora] = 0
    }

    vendasPorHorario[hora] +=
      Number(venda.valor)
  })

  const graficoVendas = Object.keys(
    vendasPorHorario
  ).map((hora) => ({

    nome: hora,
    valor: vendasPorHorario[hora]

  }))

  // STATUS

  const graficoStatus = [

    {
      name: "Pago",
      value: totalPago
    },

    {
      name: "Pendente",
      value: totalPendente
    }

  ]

  return (

    <div className="flex min-h-screen bg-[#f5f6f8]">

      <AdminSidebar />

      <main className="flex-1 p-10">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-5xl font-bold tracking-tight">
              Painel Administrativo
            </h1>

            <p className="text-zinc-500 mt-2 text-lg">
              Visão geral da operação Dona Marmita
            </p>

          </div>

          <button
            onClick={sair}
            className="bg-red-500 text-white px-6 py-3 rounded-2xl hover:opacity-90 transition-all"
          >
            Sair
          </button>

        </div>

        {/* CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">

          <div className="bg-white rounded-3xl p-7 border border-zinc-100 shadow-sm">

            <p className="text-zinc-500 mb-2">
              Faturamento Hoje
            </p>

            <h2 className="text-4xl font-bold">
              R$ {totalVendido}
            </h2>

          </div>

          <div className="bg-white rounded-3xl p-7 border border-zinc-100 shadow-sm">

            <p className="text-zinc-500 mb-2">
              Total Pago
            </p>

            <h2 className="text-4xl font-bold text-green-600">
              R$ {totalPago}
            </h2>

          </div>

          <div className="bg-white rounded-3xl p-7 border border-zinc-100 shadow-sm">

            <p className="text-zinc-500 mb-2">
              Pendências
            </p>

            <h2 className="text-4xl font-bold text-yellow-600">
              R$ {totalPendente}
            </h2>

          </div>

          <div className="bg-white rounded-3xl p-7 border border-zinc-100 shadow-sm">

            <p className="text-zinc-500 mb-2">
              Pedidos Hoje
            </p>

            <h2 className="text-4xl font-bold">
              {quantidadeVendas}
            </h2>

          </div>

        </div>

        {/* ALERTAS */}

        {rankingVendedores.some(
          (v: any) => v.pendente >= 2000
        ) && (

          <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6 mb-10">

            <h2 className="text-2xl font-bold text-yellow-700 mb-4">

              Alertas Operacionais

            </h2>

            <div className="flex flex-col gap-3">

              {rankingVendedores
                .filter(
                  (v: any) =>
                    v.pendente >= 2000
                )
                .map((v: any) => (

                  <div
                    key={v.vendedor}
                    className="bg-white rounded-2xl p-4 border border-yellow-200"
                  >

                    ⚠️ {v.vendedor} possui
                    {" "}
                    <strong>
                      R$ {v.pendente}
                    </strong>
                    {" "}
                    pendentes

                  </div>

                ))}

            </div>

          </div>

        )}

        {/* RANKING */}

        <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm mb-10">

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="text-3xl font-bold">
                Ranking de Vendedores
              </h2>

              <p className="text-zinc-500 mt-2">
                Performance da equipe hoje
              </p>

            </div>

          </div>

          <div className="flex flex-col gap-4">

            {rankingVendedores.map(
              (vendedor: any, index: number) => (

                <div
                  key={index}
                  className="border border-zinc-200 rounded-2xl p-5 flex items-center justify-between"
                >

                  <div>

                    <h3 className="text-xl font-bold">
                      {vendedor.vendedor}
                    </h3>

                    <p className="text-zinc-500 mt-1">

                      {vendedor.pedidos}
                      {" "}
                      pedidos realizados

                    </p>

                  </div>

                  <div className="text-right">

                    <h3 className="text-2xl font-bold">

                      R$ {vendedor.total}

                    </h3>

                    <p className="text-yellow-600 font-medium mt-1">

                      Pendentes:
                      {" "}
                      R$ {vendedor.pendente}

                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

        {/* GRÁFICOS */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* FATURAMENTO */}

          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">

            <h2 className="text-3xl font-bold mb-8">
              Movimento por Horário
            </h2>

            <div className="h-96">

              <ResponsiveContainer width="100%" height="100%">

                <BarChart data={graficoVendas}>

                  <XAxis dataKey="nome" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="valor"
                    radius={[12, 12, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* STATUS */}

          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">

            <h2 className="text-3xl font-bold mb-8">
              Status das Vendas
            </h2>

            <div className="h-96">

              <ResponsiveContainer width="100%" height="100%">

                <PieChart>

                  <Pie
                    data={graficoStatus}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    cx="50%"
                    cy="50%"
                    label
                  >

                    <Cell fill="#16a34a" />
                    <Cell fill="#ca8a04" />

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

      </main>

    </div>
  )
}
