"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Sidebar from "@/components/ui/Sidebar"

export default function Home() {

  const router = useRouter()

  const [cliente, setCliente] = useState("")
  const [vendedor, setVendedor] = useState("")
  const [valor, setValor] = useState("")
  const [status, setStatus] = useState("Pendente")

  const [vendas, setVendas] = useState<any[]>([])

  const [usuario, setUsuario] = useState<any>(null)

  // BUSCAR VENDAS

  async function buscarVendas() {

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("Usuário não encontrado")
      return
    }

    const { data, error } = await supabase
      .from("vendas")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false })

    if (error) {
      console.log(error)
      return
    }

    setVendas(data || [])
  }

  // SALVAR VENDA

  async function salvarVenda() {

    if (!cliente || !vendedor || !valor) {
      alert("Preencha todos os campos")
      return
    }

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      alert("Usuário não autenticado")
      return
    }

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
    setStatus("Pendente")

    buscarVendas()
  }

  // VERIFICAR LOGIN

  useEffect(() => {

    async function verificarUsuario() {

      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setUsuario(user)

      buscarVendas()
    }

    verificarUsuario()

  }, [])

  // RESUMO FINANCEIRO

  const totalVendido = vendas.reduce(
    (total, venda) => total + Number(venda.valor),
    0
  )

  const totalPago = vendas
    .filter((venda) => venda.status === "Pago")
    .reduce(
      (total, venda) => total + Number(venda.valor),
      0
    )

  const totalPendente = vendas
    .filter((venda) => venda.status === "Pendente")
    .reduce(
      (total, venda) => total + Number(venda.valor),
      0
    )

  const quantidadeVendas = vendas.length

  // PEDIDOS DO DIA

  const hoje = new Date().toLocaleDateString("pt-BR")

  const pedidosHoje = vendas.filter((venda) => {

    const dataVenda = new Date(
      venda.created_at
    ).toLocaleDateString("pt-BR")

    return dataVenda === hoje
  })

  // ÚLTIMAS VENDAS

  const ultimasVendas = vendas.slice(0, 5)

  // NOME DO USUÁRIO

  const nomeUsuario = usuario?.email
    ?.split("@")[0]

  return (

    <div className="flex min-h-screen bg-zinc-100">

      {/* SIDEBAR */}

      <Sidebar />

      {/* CONTEÚDO */}

      <main className="flex-1 p-10">

        {/* TOPO */}

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-4xl font-bold">
              Dashboard
            </h1>

            <div className="flex items-center gap-3 mt-3">

              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
                {nomeUsuario?.charAt(0).toUpperCase()}
              </div>

              <div>

                <p className="font-semibold capitalize">
                  {nomeUsuario}
                </p>

                <p className="text-sm text-gray-500">
                  Vendedor
                </p>

              </div>

            </div>

          </div>

          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push("/login")
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-xl hover:opacity-90"
          >
            Sair
          </button>

        </div>

        {/* CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">

          <div className="bg-white rounded-2xl p-5 shadow-sm">

            <p className="text-gray-500 mb-2">
              Total Vendido
            </p>

            <h2 className="text-3xl font-bold">
              R$ {totalVendido}
            </h2>

          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">

            <p className="text-gray-500 mb-2">
              Total Pago
            </p>

            <h2 className="text-3xl font-bold text-green-600">
              R$ {totalPago}
            </h2>

          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">

            <p className="text-gray-500 mb-2">
              Pendente
            </p>

            <h2 className="text-3xl font-bold text-yellow-600">
              R$ {totalPendente}
            </h2>

          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">

            <p className="text-gray-500 mb-2">
              Pedidos Hoje
            </p>

            <h2 className="text-3xl font-bold">
              {pedidosHoje.length}
            </h2>

          </div>

        </div>

        {/* GRID PRINCIPAL */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* NOVA VENDA */}

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
                <option>Pendente</option>
                <option>Pago</option>
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

          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold">
                Últimas Vendas
              </h2>

              <button
                onClick={() =>
                  router.push("/vendas")
                }
                className="text-sm bg-black text-white px-4 py-2 rounded-xl"
              >
                Ver Todas
              </button>

            </div>

            <div className="flex flex-col gap-4">

              {ultimasVendas.length === 0 && (
                <p>Nenhuma venda encontrada.</p>
              )}

              {ultimasVendas.map((venda) => (

                <div
                  key={venda.id}
                  className="border rounded-xl p-4"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="font-bold text-lg">
                        {venda.cliente}
                      </h3>

                      <p className="text-gray-500">
                        R$ {venda.valor}
                      </p>

                    </div>

                    <div>

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          venda.status === "Pago"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {venda.status === "Pago"
                          ? "✅ Pago"
                          : "⏳ Pendente"}
                      </span>

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