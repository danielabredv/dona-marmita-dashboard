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

  // NOVO

  const [origem, setOrigem] =
    useState("WhatsApp")

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

    if (!cliente || !vendedor || !valor) {

      alert("Preencha todos os campos")

      return
    }

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {

      alert("Usuário não autenticado")

      return
    }

    const { error } = await supabase
      .from("vendas")
      .insert([
        {
          cliente,
          vendedor,
          valor: Number(valor),
          status,
          origem,
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

    // NOVO

    setOrigem("WhatsApp")

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
              Controle completo das vendas
            </p>

          </div>

        </div>

        {/* CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">

          <div className="bg-white rounded-3xl p-7 shadow-sm border border-zinc-100">

            <div className="flex items-center justify-between mb-4">

              <TrendingUp className="text-black" />

              <span className="text-zinc-400 text-sm">
                Hoje
              </span>

            </div>

            <h2 className="text-zinc-500 mb-2">
              Total Vendido
            </h2>

            <p className="text-4xl font-bold">
              R$ {totalVendido}
            </p>

          </div>

          <div className="bg-white rounded-3xl p-7 shadow-sm border border-zinc-100">

            <div className="flex items-center justify-between mb-4">

              <Flame className="text-green-600" />

              <span className="text-zinc-400 text-sm">
                Pago
              </span>

            </div>

            <h2 className="text-zinc-500 mb-2">
              Total Pago
            </h2>

            <p className="text-4xl font-bold text-green-600">
              R$ {totalPago}
            </p>

          </div>

          <div className="bg-white rounded-3xl p-7 shadow-sm border border-zinc-100">

            <div className="flex items-center justify-between mb-4">

              <AlertTriangle className="text-yellow-500" />

              <span className="text-zinc-400 text-sm">
                Pendente
              </span>

            </div>

            <h2 className="text-zinc-500 mb-2">
              Total Pendente
            </h2>

            <p className="text-4xl font-bold text-yellow-500">
              R$ {totalPendente}
            </p>

          </div>

          <div className="bg-white rounded-3xl p-7 shadow-sm border border-zinc-100">

            <div className="flex items-center justify-between mb-4">

              <TrendingUp className="text-blue-500" />

              <span className="text-zinc-400 text-sm">
                Pedidos
              </span>

            </div>

            <h2 className="text-zinc-500 mb-2">
              Quantidade
            </h2>

            <p className="text-4xl font-bold text-blue-500">
              {quantidadeVendas}
            </p>

          </div>

        </div>

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

              {/* NOVO SELECT */}

              <select
                value={origem}
                onChange={(e) =>
                  setOrigem(e.target.value)
                }
                className="border border-zinc-200 bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-black"
              >

                <option value="WhatsApp">
                  WhatsApp
                </option>

                <option value="QrPedir">
                  QrPedir
                </option>

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

                      <div>

                        <p className="text-sm text-zinc-500">
                          {venda.vendedor}
                        </p>

                        <p className="text-xs text-zinc-400 mt-1">

                          Origem:
                          {" "}

                          <strong>

                            {venda.origem || "WhatsApp"}

                          </strong>

                        </p>

                      </div>

                    </div>

                    <div className="text-right">

                      <h3 className="font-bold">
                        R$ {venda.valor}
                      </h3>

                      <p
                        className={`text-sm ${
                          venda.status === "Pago"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {venda.status}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">

                        {new Date(
                          new Date(venda.created_at)
                            .getTime() - 3 * 60 * 60 * 1000
                        ).toLocaleString("pt-BR")}

                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </main>

    </div>
  )
}
