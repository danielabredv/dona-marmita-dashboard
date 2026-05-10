"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Sidebar from "@/components/ui/Sidebar"

export default function PedidosDiaPage() {

  const [pedidosHoje, setPedidosHoje] = useState<any[]>([])

  async function buscarPedidosHoje() {

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

    const hoje = new Date()
      .toISOString()
      .split("T")[0]

    const pedidosFiltrados = (data || [])
      .filter((venda) => {

        const dataVenda =
          venda.created_at.split("T")[0]

        return dataVenda === hoje
      })

    setPedidosHoje(pedidosFiltrados)
  }

  async function atualizarStatus(
    id: number,
    statusAtual: string
  ) {

    const novoStatus =
      statusAtual === "Pago"
        ? "Pendente"
        : "Pago"

    await supabase
      .from("vendas")
      .update({
        status: novoStatus
      })
      .eq("id", id)

    buscarPedidosHoje()
  }

  useEffect(() => {

    buscarPedidosHoje()

  }, [])

  return (

    <div className="flex min-h-screen bg-zinc-100">

      <Sidebar />

      <main className="flex-1 p-10">

        <h1 className="text-4xl font-bold mb-8">
          Pedidos do Dia
        </h1>

        <div className="flex flex-col gap-4">

          {pedidosHoje.map((pedido) => (

            <div
              key={pedido.id}
              className="bg-white rounded-2xl p-5 shadow-sm"
            >

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold">
                    {pedido.cliente}
                  </h2>

                  <p className="text-gray-500">
                    Vendedor: {pedido.vendedor}
                  </p>

                  <p className="text-lg font-semibold mt-1">
                    R$ {pedido.valor}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">

                    {new Date(
                      new Date(pedido.created_at)
                        .getTime() - 3 * 60 * 60 * 1000
                    ).toLocaleString("pt-BR")}

                  </p>

                </div>

                <button
                  onClick={() =>
                    atualizarStatus(
                      pedido.id,
                      pedido.status
                    )
                  }
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    pedido.status === "Pago"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {pedido.status === "Pago"
                    ? "✅ Pago"
                    : "⏳ Pendente"}
                </button>

              </div>

            </div>

          ))}

          {pedidosHoje.length === 0 && (

            <div className="bg-white rounded-2xl p-10 shadow-sm text-center">

              <h2 className="text-2xl font-bold mb-2">
                Nenhum pedido hoje
              </h2>

              <p className="text-gray-500">
                Os pedidos do dia aparecerão aqui.
              </p>

            </div>

          )}

        </div>

      </main>

    </div>
  )
}
