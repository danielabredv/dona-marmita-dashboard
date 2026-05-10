"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Sidebar from "@/components/ui/Sidebar"

export default function PendentesPage() {

  const [pendentes, setPendentes] = useState<any[]>([])

  async function buscarPendentes() {

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("vendas")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "Pendente")
      .order("created_at", {
        ascending: false
      })

    setPendentes(data || [])
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

    buscarPendentes()
  }

  useEffect(() => {

    buscarPendentes()

  }, [])

  return (

    <div className="flex min-h-screen bg-zinc-100">

      <Sidebar />

      <main className="flex-1 p-10">

        <h1 className="text-4xl font-bold mb-8">
          Clientes Pendentes
        </h1>

        <div className="flex flex-col gap-4">

          {pendentes.map((venda) => (

            <div
              key={venda.id}
              className="bg-white rounded-2xl p-5 shadow-sm"
            >

              <div className="flex items-center justify-between">

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
                      new Date(pedido.created_at)
                        .getTime() - 3 * 60 * 60 * 1000
                    ).toLocaleString("pt-BR")}

                  </p>

                </div>

                <button
                  onClick={() =>
                    atualizarStatus(
                      venda.id,
                      venda.status
                    )
                  }
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700"
                >
                  ⏳ Pendente
                </button>

              </div>

            </div>

          ))}

          {pendentes.length === 0 && (

            <div className="bg-white rounded-2xl p-10 shadow-sm text-center">

              <h2 className="text-2xl font-bold mb-2">
                Nenhum cliente pendente
              </h2>

              <p className="text-gray-500">
                Os clientes pendentes aparecerão aqui.
              </p>

            </div>

          )}

        </div>

      </main>

    </div>
  )
}
