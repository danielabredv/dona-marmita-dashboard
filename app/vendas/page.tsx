"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Sidebar from "@/components/ui/Sidebar"

export default function VendasPage() {

  const [vendas, setVendas] = useState<any[]>([])

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

    buscarVendas()
  }

  async function excluirVenda(id: number) {

    const confirmar = confirm(
      "Deseja excluir esta venda?"
    )

    if (!confirmar) return

    await supabase
      .from("vendas")
      .delete()
      .eq("id", id)

    buscarVendas()
  }

  useEffect(() => {

    buscarVendas()

  }, [])

  return (

    <div className="flex min-h-screen bg-zinc-100">

      <Sidebar />

      <main className="flex-1 p-10">

        <h1 className="text-4xl font-bold mb-8">
          Minhas Vendas
        </h1>

        <div className="flex flex-col gap-4">

          {vendas.map((venda) => (

            <div
              key={venda.id}
              className="bg-white rounded-2xl p-5 shadow-sm"
            >

              <div className="flex items-center justify-between mb-4">

                <div>

                  <h2 className="text-xl font-bold">
                    {venda.cliente}
                  </h2>

                  <p className="text-gray-500">
                    Vendedor: {venda.vendedor}
                  </p>

                  <p className="text-lg font-semibold mt-1">
                    R$ {venda.valor}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">

                    {new Date(
                      new Date(venda.created_at)
                        .getTime() - 3 * 60 * 60 * 1000
                    ).toLocaleString("pt-BR")}

                  </p>

                </div>

                <div className="flex flex-col items-end gap-3">

                  <button
                    onClick={() =>
                      atualizarStatus(
                        venda.id,
                        venda.status
                      )
                    }
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      venda.status === "Pago"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {venda.status === "Pago"
                      ? "✅ Pago"
                      : "⏳ Pendente"}
                  </button>

                  <button
                    onClick={() =>
                      excluirVenda(venda.id)
                    }
                    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:opacity-90"
                  >
                    Excluir Venda
                  </button>

                </div>

              </div>

            </div>

          ))}

          {vendas.length === 0 && (

            <div className="bg-white rounded-2xl p-10 shadow-sm text-center">

              <h2 className="text-2xl font-bold mb-2">
                Nenhuma venda encontrada
              </h2>

              <p className="text-gray-500">
                As vendas aparecerão aqui.
              </p>

            </div>

          )}

        </div>

      </main>

    </div>
  )
}
