"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/ui/Sidebar"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {

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

  return (

    <div className="flex min-h-screen bg-zinc-100">

      <Sidebar />

      <main className="flex-1 p-10">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-4xl font-bold">
              Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Controle operacional Dona Marmita
            </p>

          </div>

        </div>

        {/* CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <p className="text-gray-500 mb-2">
              Total Hoje
            </p>

            <h2 className="text-4xl font-bold">
              R$ {totalVendido}
            </h2>

          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <p className="text-gray-500 mb-2">
              Pagos
            </p>

            <h2 className="text-4xl font-bold text-green-600">
              R$ {totalPago}
            </h2>

          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <p className="text-gray-500 mb-2">
              Pendentes
            </p>

            <h2 className="text-4xl font-bold text-yellow-600">
              R$ {totalPendente}
            </h2>

          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <p className="text-gray-500 mb-2">
              Pedidos Hoje
            </p>

            <h2 className="text-4xl font-bold">
              {quantidadeVendas}
            </h2>

          </div>

        </div>

        {/* FORM + ÚLTIMAS VENDAS */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

          {/* FORMULÁRIO */}

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <h2 className="text-2xl font-bold mb-6">
              Nova Venda
            </h2>

            <div className="flex flex-col gap-4">

              <input
                type="text"
                placeholder="Cliente"
                value={cliente}
                onChange={(e) =>
                  setCliente(e.target.value)
                }
                className="border p-3 rounded-xl"
              />

              <input
                type="text"
                placeholder="Vendedor"
                value={vendedor}
                onChange={(e) =>
                  setVendedor(e.target.value)
                }
                className="border p-3 rounded-xl"
              />

              <input
                type="number"
                placeholder="Valor"
                value={valor}
                onChange={(e) =>
                  setValor(e.target.value)
                }
                className="border p-3 rounded-xl"
              />

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="border p-3 rounded-xl"
              >
                <option>Pago</option>
                <option>Pendente</option>
              </select>

              <button
                onClick={salvarVenda}
                className="bg-black text-white p-3 rounded-xl hover:opacity-90"
              >
                Salvar Venda
              </button>

            </div>

          </div>

          {/* ÚLTIMAS VENDAS */}

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <h2 className="text-2xl font-bold mb-6">
              Últimas Vendas
            </h2>

            <div className="flex flex-col gap-4">

              {vendas.slice(0, 5).map((venda) => (

                <div
                  key={venda.id}
                  className="border rounded-xl p-4"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="font-bold">
                        {venda.cliente}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {venda.vendedor}
                      </p>

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
                        venda.created_at
                        ).toLocaleString("pt-BR", {
                          timeZone: "America/Sao_Paulo"
                      })}

                      
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
