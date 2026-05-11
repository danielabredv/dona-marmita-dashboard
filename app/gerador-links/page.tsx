"use client"

import { useState } from "react"
import Sidebar from "@/components/ui/Sidebar"
import { supabase } from "@/lib/supabase"

import {
  Copy,
  Link2,
  Search,
  CircleAlert
} from "lucide-react"

export default function GeradorLinksPage() {

  const [valor, setValor] = useState("")
  const [link, setLink] = useState("")

  const [valorBusca, setValorBusca] = useState("")
  const [linkEncontrado, setLinkEncontrado] = useState<any>(null)

  // SALVAR LINK

  async function salvarLink() {

    if (!valor || !link) {

      alert("Preencha todos os campos")

      return
    }

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from("links_pagamento")
      .insert([
        {
          valor: Number(valor),
          link,
          user_id: user.id
        }
      ])

    if (error) {

      console.log(error)

      alert("Erro ao salvar link")

      return
    }

    alert("Link salvo com sucesso")

    setValor("")
    setLink("")
  }

  // BUSCAR LINK

  async function buscarLink() {

    if (!valorBusca) {

      alert("Digite um valor")

      return
    }

    const { data } = await supabase
      .from("links_pagamento")
      .select("*")
      .eq("valor", Number(valorBusca))
      .order("created_at", {
        ascending: false
      })
      .limit(1)

    if (!data || data.length === 0) {

      setLinkEncontrado(null)

      return
    }

    setLinkEncontrado(data[0])
  }

  // COPIAR LINK

  async function copiarLink() {

    if (!linkEncontrado?.link) return

    await navigator.clipboard.writeText(
      linkEncontrado.link
    )

    alert("Link copiado")
  }

  return (

    <div className="flex min-h-screen bg-[#f5f6f8]">

      <Sidebar />

      <main className="flex-1 p-10">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-5xl font-bold tracking-tight">
            Gerador de Links
          </h1>

          <p className="text-zinc-500 mt-2 text-lg">
            Controle de links Mercado Pago
          </p>

        </div>

        {/* GRID */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ESQUERDA */}

          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

            <div className="flex items-center gap-3 mb-8">

              <div className="bg-black text-white p-3 rounded-2xl">

                <Link2 size={24} />

              </div>

              <div>

                <h2 className="text-3xl font-bold">
                  Salvar Link
                </h2>

                <p className="text-zinc-500">
                  Mercado Pago
                </p>

              </div>

            </div>

            <div className="flex flex-col gap-5">

              <input
                type="number"
                placeholder="Valor"
                value={valor}
                onChange={(e) =>
                  setValor(e.target.value)
                }
                className="border border-zinc-200 bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-black"
              />

              <textarea
                placeholder="Cole o link Mercado Pago"
                value={link}
                onChange={(e) =>
                  setLink(e.target.value)
                }
                className="border border-zinc-200 bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-black h-40 resize-none"
              />

              <button
                onClick={salvarLink}
                className="bg-black text-white p-4 rounded-2xl hover:opacity-90 transition-all font-medium"
              >
                Salvar Link
              </button>

            </div>

          </div>

          {/* DIREITA */}

          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

            <div className="flex items-center gap-3 mb-8">

              <div className="bg-blue-500 text-white p-3 rounded-2xl">

                <Search size={24} />

              </div>

              <div>

                <h2 className="text-3xl font-bold">
                  Buscar Link
                </h2>

                <p className="text-zinc-500">
                  Busca rápida por valor
                </p>

              </div>

            </div>

            <div className="flex flex-col gap-5">

              <input
                type="number"
                placeholder="Valor do link"
                value={valorBusca}
                onChange={(e) =>
                  setValorBusca(e.target.value)
                }
                className="border border-zinc-200 bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-black"
              />

              <button
                onClick={buscarLink}
                className="bg-blue-500 text-white p-4 rounded-2xl hover:opacity-90 transition-all font-medium"
              >
                Buscar Link
              </button>

              {/* RESULTADO */}

              {linkEncontrado ? (

                <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 mt-2">

                  <p className="text-sm text-zinc-500 mb-2">
                    Link encontrado
                  </p>

                  <div className="bg-white border border-zinc-200 rounded-2xl p-4 break-all text-sm">

                    {linkEncontrado.link}

                  </div>

                  <button
                    onClick={copiarLink}
                    className="mt-5 w-full bg-black text-white p-4 rounded-2xl hover:opacity-90 transition-all font-medium flex items-center justify-center gap-2"
                  >

                    <Copy size={18} />

                    Copiar Link

                  </button>

                </div>

              ) : (

                <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6 flex items-center gap-4 mt-2">

                  <div className="bg-yellow-100 p-3 rounded-2xl">

                    <CircleAlert
                      className="text-yellow-500"
                      size={24}
                    />

                  </div>

                  <div>

                    <h3 className="font-bold text-yellow-700">
                      Nenhum link encontrado
                    </h3>

                    <p className="text-sm text-yellow-600 mt-1">

                      Busque um valor válido para localizar o link

                    </p>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      </main>

    </div>
  )
}
