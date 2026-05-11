"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import {
  LayoutDashboard,
  ShoppingCart,
  CircleDollarSign,
  Clock3,
  Package,
  Link2,
  LogOut
} from "lucide-react"

import { supabase } from "@/lib/supabase"

export default function Sidebar() {

  const pathname = usePathname()
  const router = useRouter()

  async function sair() {

    await supabase.auth.signOut()

    router.push("/login")
  }

  const menu = [

    {
      nome: "Dashboard",
      rota: "/",
      icon: LayoutDashboard
    },

    {
      nome: "Pedidos do Dia",
      rota: "/pedidos-dia",
      icon: ShoppingCart
    },

    {
      nome: "Central Financeira",
      rota: "/financeiro",
      icon: CircleDollarSign
    },

    {
      nome: "Pendentes",
      rota: "/pendentes",
      icon: Clock3
    },

    {
      nome: "Minhas Vendas",
      rota: "/vendas",
      icon: Package
    },
    
    {
      nome: "Gerador de Links",
      rota: "/gerador-links",
      icon: Link2

    }
  ]

  return (

    <aside className="w-72 min-h-screen bg-black text-white p-6 flex flex-col justify-between">

      <div>

        {/* LOGO */}

        <div className="mb-12">

          <h1 className="text-3xl font-bold">
            Dona Marmita
          </h1>

          <p className="text-zinc-400 mt-2">
            Controle Operacional
          </p>

        </div>

        {/* MENU */}

        <nav className="flex flex-col gap-3">

          {menu.map((item) => {

            const Icon = item.icon

            const ativo =
              pathname === item.rota

            return (

              <Link
                key={item.rota}
                href={item.rota}
                className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-200 ${
                  ativo
                    ? "bg-white text-black"
                    : "hover:bg-zinc-900 text-zinc-300"
                }`}
              >

                <Icon size={22} />

                <span className="font-medium">
                  {item.nome}
                </span>

              </Link>
            )
          })}

        </nav>

      </div>

      {/* SAIR */}

      <button
        onClick={sair}
        className="flex items-center gap-3 px-4 py-4 rounded-2xl hover:bg-red-500/20 text-red-400 transition-all duration-200"
      >

        <LogOut size={22} />

        <span className="font-medium">
          Sair
        </span>

      </button>

    </aside>
  )
}
