"use client"

import { useEffect, useState } from "react"

import { supabase } from "@/lib/supabase"

import AdminSidebar from "@/components/ui/AdminSidebar"

import {
  Trash2,
  CheckCircle2,
  Clock3,
  Users
} from "lucide-react"

export default function EquipeAdminPage() {

  const [vendas, setVendas] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  // BUSCAR VENDAS

  async function buscarVendas() {

    setLoading(true)

    const { data, error } =
      await supabase
        .from("vendas")
        .select("*")
        .order("created_at", {
          ascending: false
        })

    if (error) {

      console.log(error)

      setLoading(false)

      return
    }

    setVendas(data || [])

    setLoading(false)
  }

  // ATUALIZAR STATUS

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

  // EXCLUIR VENDA

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

  // TOTAL VENDAS

  const totalVendido =
    vendas.reduce(
      (total, venda) =>
        total + Number(venda.valor),
      0
    )

  // TOTAL PAGO

  const totalPago =
    vendas
      .filter(
        (venda) =>
          venda.status === "Pago"
      )
      .reduce(
        (total, venda) =>
          total + Number(venda.valor),
        0
      )

  // TOTAL PENDENTE

  const totalPendente =
    vendas
      .filter(
        (venda) =>
          venda.status === "Pendente"
      )
      .reduce(
        (total, venda) =>
          total + Number(venda.valor),
        0
      )

  return (

    <div className="flex min-h-screen bg-[#f5f6f8]">

      {/* SIDEBAR */}

      <AdminSidebar />

      {/* CONTEÚDO */}

      <main className="flex-1 p-10">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-5xl font-bold tracking-tight">

            Controle da Equipe

          </h1>

          <p className="text-zinc-500 mt-2 text-lg">

            Gestão completa de vendas e vendedores

          </p>

        </div>

        {/* CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          {/* TOTAL */}

          <div className="bg-white rounded-3xl p-7 border border-zinc-100 shadow-sm">

            <div className="flex items-center justify-between mb-5">

              <div className="bg-black text-white p-3 rounded-2xl">

                <Users size={24} />

              </div>

            </div>

            <p className="text-zinc-500 mb-2">
              Total em vendas
            </p>

            <h2 className="text-4xl font-bold">

              R$ {totalVendido}

            </h2>

          </div>

          {/* PAGOS */}

          <div className="bg-white rounded-3xl p-7 border border-zinc-100 shadow-sm">

            <div className="flex items-center justify-between mb-5">

              <div className="bg-green-500 text-white p-3 rounded-2xl">

                <CheckCircle2 size={24} />

              </div>

            </div>

            <p className="text-zinc-500 mb-2">
              Total pago
            </p>

            <h2 className="text-4xl font-bold text-green-600">

              R$ {totalPago}

            </h2>

          </div>

          {/* PENDENTES */}

          <div className="bg-white rounded-3xl p-7 border border-zinc-100 shadow-sm">

            <div className="flex items-center justify-between mb-5">

              <div className="bg-yellow-500 text-white p-3 rounded-2xl">

                <Clock3 size={24} />

              </div>

            </div>

            <p className="text-zinc-500 mb-2">
              Pendências
            </p>

            <h2 className="text-4xl font-bold text-yellow-600">

              R$ {totalPendente}

            </h2>

          </div>

        </div>

        {/* LISTA */}

        <div className="flex flex-col gap-5">

          {loading && (

            <div className="bg-white rounded-3xl p-10 border border-zinc-100 shadow-sm text-center">

              <h2 className="text-2xl font-bold">

                Carregando equipe...

              </h2>

            </div>

          )}

          {!loading &&
            vendas.map((venda) => (

              <div
                key={venda.id}
                className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm"
              >

                <div className="flex items-center justify-between">

                  {/* ESQUERDA */}

                  <div>

                    <h2 className="text-2xl font-bold">

                      {venda.cliente}

                    </h2>

                    <p className="text-zinc-500 mt-2">

                      Vendedor:
                      {" "}
                      <strong>
                        {venda.vendedor}
                      </strong>

                    </p>

                    <p className="text-zinc-400 text-sm mt-3">

                      {new Date(
                        new Date(venda.created_at)
                          .getTime() -
                          3 * 60 * 60 * 1000
                      ).toLocaleString("pt-BR")}

                    </p>

                  </div>

                  {/* DIREITA */}

                  <div className="flex flex-col items-end gap-4">

                    <h2 className="text-4xl font-bold">

                      R$ {venda.valor}

                    </h2>

                    <button
                      onClick={() =>
                        atualizarStatus(
                          venda.id,
                          venda.status
                        )
                      }
                      className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                        venda.status === "Pago"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
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
                      className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl transition-all flex items-center gap-2"
                    >

                      <Trash2 size={18} />

                      Excluir Venda

                    </button>

                  </div>

                </div>

              </div>

            ))}

          {/* VAZIO */}

          {!loading &&
            vendas.length === 0 && (

              <div className="bg-white rounded-3xl p-14 border border-zinc-100 shadow-sm text-center">

                <h2 className="text-3xl font-bold mb-3">

                  Nenhuma venda encontrada

                </h2>

                <p className="text-zinc-500 text-lg">

                  As vendas da equipe aparecerão aqui.

                </p>

              </div>

            )}

        </div>

      </main>

    </div>
  )
}
