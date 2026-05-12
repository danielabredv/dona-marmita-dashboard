"use client"

import { useState } from "react"

import { supabase } from "@/lib/supabase"

import AdminSidebar from "@/components/ui/AdminSidebar"

import {
  Copy,
  Link2,
  Search,
  CircleAlert,
  CheckCircle2
} from "lucide-react"

export default function LinksAdminPage() {

  const [valor, setValor] = useState("")
  const [link, setLink] = useState("")

  const [valorBusca, setValorBusca] =
    useState("")

  const [linkEncontrado, setLinkEncontrado] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(false)

  // SALVAR LINK

  async function salvarLink() {

    if (!valor || !link) {

      alert("Preencha todos os campos")

      return
    }

    setLoading(true)

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {

      setLoading(false)

      return
    }

    const { error } = await supabase
      .from("links_pagamento")
      .insert([
        {
          valor: Number(valor),
          link,
          user_id: user.id
        }
      ])

    setLoading(false)

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

    const { data, error } =
      await supabase
        .from("links_pagamento")
        .select("*")
        .eq("valor", Number(valorBusca))
        .order("created_at", {
          ascending: false
        })
        .limit(1)

    if (error) {

      console.log(error)

      return
    }

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

      {/* SIDEBAR ADM */}

      <AdminSidebar />

      {/* CONTEÚDO */}

      <main className="flex-1 p-10">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-5xl font-bold tracking-tight">

            Links Mercado Pago

          </h1>

          <p className="text-zinc-500 mt-2 text-lg">

            Controle administrativo de links

          </p>

        </div>

        {/* GRID */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* SALVAR LINK */}

          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">

            <div className="flex items-center gap-4 mb-8">

              <div className="bg-black text-white p-4 rounded-2xl">

                <Link2 size={24} />

              </div>

              <div>

                <h2 className="text-3xl font-bold">
                  Novo Link
                </h2>

                <p className="text-zinc-500">
                  Adicionar link Mercado Pago
                </p>

              </div>

            </div>

            <div className="flex flex-col gap-5">

              <input
                type="number"
                placeholder="Valor do link"
                value={valor}
                onChange={(e) =>
                  setValor(e.target.value)
                }
                className="border border-zinc-200 rounded-2xl p-4 outline-none focus:border-black transition-all"
              />

              <textarea
                placeholder="Cole o link Mercado Pago"
                value={link}
                onChange={(e) =>
                  setLink(e.target.value)
                }
                className="border border-zinc-200 rounded-2xl p-4 outline-none focus:border-black transition-all min-h-[160px]"
              />

              <button
                onClick={salvarLink}
                disabled={loading}
                className="bg-black text-white rounded-2xl py-4 font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >

                {loading
                  ? "Salvando..."
                  : "Salvar Link"}

              </button>

            </div>

          </div>

          {/* BUSCAR LINK */}

          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">

            <div className="flex items-center gap-4 mb-8">

              <div className="bg-yellow-500 text-white p-4 rounded-2xl">

                <Search size={24} />

              </div>

              <div>

                <h2 className="text-3xl font-bold">
                  Buscar Link
                </h2>

                <p className="text-zinc-500">
                  Buscar por valor
                </p>

              </div>

            </div>

            <div className="flex flex-col gap-5">

              <input
                type="number"
                placeholder="Digite o valor"
                value={valorBusca}
                onChange={(e) =>
                  setValorBusca(e.target.value)
                }
                className="border border-zinc-200 rounded-2xl p-4 outline-none focus:border-black transition-all"
              />

              <button
                onClick={buscarLink}
                className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl py-4 font-semibold transition-all"
              >

                Buscar Link

              </button>

            </div>

            {/* RESULTADO */}

            {linkEncontrado && (

              <div className="mt-8 bg-zinc-50 border border-zinc-200 rounded-3xl p-6">

                <div className="flex items-center gap-3 mb-5">

                  <CheckCircle2
                    className="text-green-600"
                    size={24}
                  />

                  <h3 className="text-2xl font-bold">

                    Link Encontrado

                  </h3>

                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-4 break-all text-sm text-zinc-700">

                  {linkEncontrado.link}

                </div>

                <button
                  onClick={copiarLink}
                  className="mt-5 flex items-center gap-3 bg-black text-white px-5 py-3 rounded-2xl hover:opacity-90 transition-all"
                >

                  <Copy size={18} />

                  Copiar Link

                </button>

              </div>

            )}

            {/* NÃO ENCONTRADO */}

            {!linkEncontrado &&
              valorBusca && (

                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-3xl p-6">

                  <div className="flex items-center gap-3">

                    <CircleAlert
                      className="text-yellow-700"
                      size={24}
                    />

                    <div>

                      <h3 className="font-bold text-yellow-700">

                        Nenhum link encontrado

                      </h3>

                      <p className="text-yellow-600 text-sm mt-1">

                        Não existe link salvo para esse valor.

                      </p>

                    </div>

                  </div>

                </div>

              )}

          </div>

        </div>

      </main>

    </div>
  )
}
