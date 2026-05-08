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
      .order("id", { ascending: false })

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
                    R$ {venda.valor}
                  </p>

                </div>

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

              </div>

              <p>
                <strong>Vendedor:</strong>{" "}
                {venda.vendedor}
              </p>

              <p>
                <strong>Data:</strong>{" "}
                {new Date(
                  venda.created_at
                ).toLocaleString("pt-BR")}
              </p>

              <button
                onClick={() =>
                  excluirVenda(venda.id)
                }
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-xl"
              >
                Excluir Venda
              </button>

            </div>

          ))}

        </div>

      </main>

    </div>
  )
}