"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/ui/Sidebar"
import { supabase } from "@/lib/supabase"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

import {
  AlertTriangle,
  Flame,
  TrendingUp
} from "lucide-react"

export default function DashboardPage() {

  const router = useRouter()

  const [cliente, setCliente] = useState("")
  const [vendedor, setVendedor] = useState("")
  const [valor, setValor] = useState("")
  const [status, setStatus] = useState("Pago")

  const [vendas, setVendas] = useState<any[]>([])

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
      .order("created_at", {
        ascending: false
      })

    setVendas(data || [])
  }

  // SALVAR VENDA

  async function salvarVenda() {

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from("vendas")
      .insert([
        {
          cliente,
          vendedor,
          valor: Number(valor),
          status,
          user_id: user.id
        }
      ])

    if (error) {

      console.log(error)
      alert("Erro ao salvar")

      return
    }

    alert("Venda salva com sucesso")

    setCliente("")
    setVendedor("")
    setValor("")
    setStatus("Pago")

    buscarVendas()
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

  // VENDAS DE HOJE

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

    vendasPorHorario[hora] += Number(venda.valor)
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

      <Sidebar />

      <main className="flex-1 p-10">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-5xl font-bold tracking-tight">
              Dashboard
            </h1>

            <p className="text-zinc-500 mt-2 text-lg">
              Controle operacional Dona Marmita
            </p>

          </div>

          <button
            onClick={sair}
            className="bg-white border border-zinc-200 px-5 py-3 rounded-2xl hover:shadow-md transition-all"
          >
            Sair
          </button>

        </div>

        {/* CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

            <p className="text-zinc-500 mb-3">
              Total Hoje
            </p>

            <h2 className="text-5xl font-bold tracking-tight">
              R$ {totalVendido}
            </h2>

          </div>

          <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

            <p className="text-zinc-500 mb-3">
              Pagos
            </p>

            <h2 className="text-5xl font-bold tracking-tight text-green-600">
              R$ {totalPago}
            </h2>

          </div>

          <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

            <p className="text-zinc-500 mb-3">
              Pendentes
            </p>

            <h2 className="text-5xl font-bold tracking-tight text-yellow-600">
              R$ {totalPendente}
            </h2>

          </div>

          <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

            <p className="text-zinc-500 mb-3">
              Pedidos Hoje
            </p>

            <h2 className="text-5xl font-bold tracking-tight">
              {quantidadeVendas}
            </h2>

          </div>

        </div>

        {/* ALERTAS DINÂMICOS */}

        {(totalPendente > 1000 ||
          quantidadeVendas > 15 ||
          totalVendido > 3000) && (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">

            {/* PENDENTE */}

            {totalPendente > 1000 && (

              <div className="bg-red-50 border border-red-200 rounded-3xl p-5 flex items-center justify-between shadow-sm">

                <div className="flex items-center gap-4">

                  <div className="bg-red-100 p-3 rounded-2xl">

                    <AlertTriangle
                      className="text-red-500"
                      size={28}
                    />

                  </div>

                  <div>

                    <h3 className="font-bold text-red-600">
                      Alto valor pendente
                    </h3>

                    <p className="text-sm text-zinc-600">

                      R$ {totalPendente} aguardando pagamento

                    </p>

                  </div>

                </div>

              </div>

            )}

            {/* PICO */}

            {quantidadeVendas > 15 && (

              <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-5 flex items-center justify-between shadow-sm">

                <div className="flex items-center gap-4">

                  <div className="bg-yellow-100 p-3 rounded-2xl">

                    <Flame
                      className="text-yellow-500"
                      size={28}
                    />

                  </div>

                  <div>

                    <h3 className="font-bold text-yellow-600">
                      Pico operacional
                    </h3>

                    <p className="text-sm text-zinc-600">

                      Alto volume de pedidos hoje

                    </p>

                  </div>

                </div>

              </div>

            )}

            {/* FATURAMENTO */}

            {totalVendido > 3000 && (

              <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 flex items-center justify-between shadow-sm">

                <div className="flex items-center gap-4">

                  <div className="bg-blue-100 p-3 rounded-2xl">

                    <TrendingUp
                      className="text-blue-500"
                      size={28}
                    />

                  </div>

                  <div>

                    <h3 className="font-bold text-blue-600">
                      Faturamento acima da média
                    </h3>

                    <p className="text-sm text-zinc-600">

                      R$ {totalVendido} vendidos hoje

                    </p>

                  </div>

                </div>

              </div>

            )}

          </div>

        )}

        {/* FORM + ÚLTIMAS VENDAS */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

          {/* FORMULÁRIO */}

          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

            <h2 className="text-3xl font-bold mb-8">
              Nova Venda
            </h2>

            <div className="flex flex-col gap-5">

              <input
                type="text"
                placeholder="Cliente"
                value={cliente}
                onChange={(e) =>
                  setCliente(e.target.value)
                }
                className="border border-zinc-200 bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-black"
              />

              <input
                type="text"
                placeholder="Vendedor"
                value={vendedor}
                onChange={(e) =>
                  setVendedor(e.target.value)
                }
                className="border border-zinc-200 bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-black"
              />

              <input
                type="number"
                placeholder="Valor"
                value={valor}
                onChange={(e) =>
                  setValor(e.target.value)
                }
                className="border border-zinc-200 bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-black"
              />

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="border border-zinc-200 bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-black"
              >
                <option>Pago</option>
                <option>Pendente</option>
              </select>

              <button
                onClick={salvarVenda}
                className="bg-black text-white p-4 rounded-2xl hover:opacity-90 transition-all font-medium"
              >
                Salvar Venda
              </button>

            </div>

          </div>

          {/* ÚLTIMAS VENDAS */}

          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

            <h2 className="text-3xl font-bold mb-8">
              Últimas Vendas
            </h2>

            <div className="flex flex-col gap-5">

              {vendas.slice(0, 5).map((venda) => (

                <div
                  key={venda.id}
                  className="bg-zinc-50 border border-zinc-100 rounded-3xl p-5"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="font-bold text-lg">
                        {venda.cliente}
                      </h3>

                      <p className="text-sm text-zinc-500">
                        {venda.vendedor}
                      </p>

                    </div>

                    <div className="text-right">

                      <h3 className="font-bold text-2xl">
                        R$ {venda.valor}
                      </h3>

                      <p
                        className={`text-sm font-medium ${
                          venda.status === "Pago"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {venda.status}
                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

        {/* GRÁFICOS */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* FATURAMENTO */}

          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

            <h2 className="text-3xl font-bold mb-8">
              Faturamento por Horário
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

          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

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
