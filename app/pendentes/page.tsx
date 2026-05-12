"use client"

import { useEffect, useState } from "react"

import { supabase } from "@/lib/supabase"

import Sidebar from "@/components/ui/Sidebar"

export default function PendentesPage() {

  const [pendentes, setPendentes] =
    useState<any[]>([])

  const [modalMensagens,
    setModalMensagens] =
      useState(false)

  // BUSCAR PENDÊNCIAS

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

    buscarPendentes()
  }

  useEffect(() => {

    buscarPendentes()

  }, [])

  // TOTAL

  const totalPendente =
    pendentes.reduce(
      (total, venda) =>
        total + Number(venda.valor),
      0
    )

  return (

    <div className="flex min-h-screen bg-[#f5f6f8]">

      <Sidebar />

      <main className="flex-1 p-10">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-5xl font-bold tracking-tight">

              Clientes Pendentes

            </h1>

            <p className="text-zinc-500 mt-2 text-lg">

              Controle rápido de cobranças

            </p>

          </div>

          <div className="bg-yellow-50 border border-yellow-200 px-6 py-4 rounded-3xl">

            <p className="text-sm text-yellow-700 mb-1">

              Total pendente

            </p>

            <h2 className="text-3xl font-bold text-yellow-700">

              R$ {totalPendente}

            </h2>

          </div>

        </div>

        {/* BOTÃO MODAL */}

        <div className="flex justify-end mb-6">

          <button
            onClick={() =>
              setModalMensagens(true)
            }
            className="bg-black text-white px-6 py-4 rounded-2xl hover:opacity-90 transition-all font-semibold"
          >

            Gerar Mensagens WhatsApp

          </button>

        </div>

        {/* LISTA */}

        <div className="flex flex-col gap-5">

          {pendentes.map((venda) => (

            <div
              key={venda.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100"
            >

              <div className="flex items-center justify-between">

                <div>

                  <div className="flex items-center gap-3 mb-3">

                    <div className="w-3 h-3 rounded-full bg-yellow-500" />

                    <span className="text-yellow-700 font-semibold">

                      Pendente

                    </span>

                  </div>

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

                  <h2 className="text-3xl font-bold text-yellow-600 mt-4">

                    R$ {venda.valor}

                  </h2>

                  <p className="text-zinc-400 text-sm mt-3">

                    {new Date(
                      new Date(venda.created_at)
                        .getTime() -
                        3 * 60 * 60 * 1000
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
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl transition-all font-semibold"
                >

                  Marcar como Pago

                </button>

              </div>

            </div>

          ))}

          {/* VAZIO */}

          {pendentes.length === 0 && (

            <div className="bg-white rounded-3xl p-14 shadow-sm border border-zinc-100 text-center">

              <h2 className="text-3xl font-bold mb-3">

                Nenhum cliente pendente

              </h2>

              <p className="text-zinc-500 text-lg">

                Os clientes pendentes aparecerão aqui.

              </p>

            </div>

          )}

        </div>

        {/* MODAL */}

        {modalMensagens && (

          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">

            <div className="bg-white w-full max-w-4xl rounded-[32px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">

              {/* HEADER */}

              <div className="flex items-center justify-between mb-8">

                <div>

                  <h2 className="text-4xl font-bold">

                    Central de Cobrança

                  </h2>

                  <p className="text-zinc-500 mt-2">

                    Mensagens automáticas para WhatsApp

                  </p>

                </div>

                <button
                  onClick={() =>
                    setModalMensagens(false)
                  }
                  className="bg-zinc-100 hover:bg-zinc-200 px-5 py-3 rounded-2xl transition-all"
                >

                  Fechar

                </button>

              </div>

              {/* RESUMO */}

              <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6 mb-8">

                <h3 className="text-2xl font-bold text-yellow-700 mb-3">

                  Resumo Geral

                </h3>

                <div className="grid grid-cols-2 gap-5">

                  <div>

                    <p className="text-zinc-500">
                      Total pendências
                    </p>

                    <h2 className="text-3xl font-bold">

                      {pendentes.length}

                    </h2>

                  </div>

                  <div>

                    <p className="text-zinc-500">
                      Valor total
                    </p>

                    <h2 className="text-3xl font-bold text-yellow-700">

                      R$ {totalPendente}

                    </h2>

                  </div>

                </div>

              </div>

              {/* LISTA */}

              <div className="flex flex-col gap-5">

                {pendentes.map((venda) => {

                  const mensagem = `Olá, tudo bem?

Identificamos uma pendência referente ao seu pedido da Dona Marmita.

Cliente: ${venda.cliente}
Valor: R$ ${venda.valor}
Vendedor: ${venda.vendedor}

Caso já tenha realizado o pagamento, desconsidere esta mensagem ❤️`

                  return (

                    <div
                      key={venda.id}
                      className="border border-zinc-200 rounded-3xl p-6"
                    >

                      <div className="flex items-start justify-between gap-6">

                        <div>

                          <h3 className="text-2xl font-bold">

                            {venda.cliente}

                          </h3>

                          <p className="text-zinc-500 mt-2">

                            Vendedor:
                            {" "}
                            <strong>
                              {venda.vendedor}
                            </strong>

                          </p>

                          <h2 className="text-3xl font-bold text-yellow-600 mt-4">

                            R$ {venda.valor}

                          </h2>

                        </div>

                        <div className="flex flex-col gap-3 min-w-[220px]">

                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(
                                mensagem
                              )
                            }
                            className="bg-black text-white py-3 rounded-2xl hover:opacity-90 transition-all font-semibold"
                          >

                            Copiar Mensagem

                          </button>

                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(mensagem)}`}
                            target="_blank"
                            className="bg-green-500 text-white py-3 rounded-2xl hover:bg-green-600 transition-all text-center font-semibold"
                          >

                            Abrir WhatsApp

                          </a>

                        </div>

                      </div>

                    </div>

                  )
                })}

              </div>

              {/* COPIAR TUDO */}

              <div className="mt-10">

                <button
                  onClick={() => {

                    const listaCompleta =
                      pendentes.map((venda) => {

                        return `Cliente: ${venda.cliente}
Valor: R$ ${venda.valor}
Vendedor: ${venda.vendedor}

----------------------`
                      }).join("\n")

                    navigator.clipboard.writeText(
                      listaCompleta
                    )

                    alert("Lista completa copiada")

                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-5 rounded-3xl text-xl font-bold transition-all"
                >

                  Copiar Lista Completa

                </button>

              </div>

            </div>

          </div>

        )}

      </main>

    </div>
  )
}
