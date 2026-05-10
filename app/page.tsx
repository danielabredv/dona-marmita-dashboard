"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/ui/Sidebar"
import { supabase } from "@/lib/supabase"

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

  useEffect(() => {

    buscarVendas()

  }, [])

  return (

    <div className="flex min-h-screen bg-zinc-100">

      <Sidebar />

      <main className="flex-1 p-10">

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-4xl font-bold">
              Minhas Vendas
            </h1>

            <p className="text-gray-500 mt-2">
              Histórico completo de vendas
            </p>

          </div>

        </div>

        {/* LISTA */}

        <div className="flex flex-col gap-5">

          {vendas.map((venda) => (

            <div
              key={venda.id}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >

              <div className="flex items-start justify-between">

                <div className="flex flex-col gap-2">

                  <h2 className="text-2xl font-bold">
                    {venda.cliente}
                  </h2>

                  <p className="text-gray-500">
                    Vendedor: {venda.vendedor}
                  </p>

                  <p className="text-lg font-semibold">
                    R$ {venda.valor}
                  </p>

                  <span
                    className={`w-fit px-4 py-1 rounded-full text-sm font-medium ${
                      venda.status === "Pago"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {venda.status}
                  </span>

                </div>

                <div className="flex flex-col items-end gap-3">

                  <span className="text-sm text-gray-400">

                    {new Date(
                      venda.created_at
                    ).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo"
                    })}

                  </span>

                  <button
                    onClick={() =>
                      atualizarStatus(
                        venda.id,
                        venda.status
                      )
                    }
                    className="bg-black text-white px-5 py-2 rounded-xl hover:opacity-90 transition"
                  >
                    Alterar Status
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
