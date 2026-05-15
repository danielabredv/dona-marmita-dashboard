"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileSpreadsheet } from "lucide-react"
import {
  LayoutDashboard,
  Users,
  Wallet,
  Clock3,
  Link2,
  LogOut
} from "lucide-react"

export default function AdminSidebar() {

  const pathname = usePathname()

  const menus = [

    {
      nome: "Dashboard",
      rota: "/dashboard-admin",
      icon: LayoutDashboard
    },

    {
      nome: "Equipe",
      rota: "/dashboard-admin/equipe",
      icon: Users
    },

    {
      nome: "Financeiro",
      rota: "/dashboard-admin/financeiro",
      icon: Wallet
    },

    {
      nome: "Pendências",
      rota: "/dashboard-admin/pendencias",
      icon: Clock3
    },

    {
      nome: "Links",
      rota: "/dashboard-admin/links",
      icon: Link2
    },

    {
  nome: "Planilhas",
  rota: "/planilhas",
  icon: FileSpreadsheet
    },

  ]

  return (

    <aside className="w-[290px] bg-black text-white min-h-screen p-7 flex flex-col justify-between">

      <div>

        {/* LOGO */}

        <div className="mb-14">

          <h1 className="text-5xl font-bold">
            Dona Marmita
          </h1>

          <p className="text-zinc-400 mt-3">
            Painel Administrativo
          </p>

        </div>

        {/* MENU */}

        <nav className="flex flex-col gap-4">

          {menus.map((item) => {

            const Icon = item.icon

            const ativo =
              pathname === item.rota

            return (

              <Link
                key={item.nome}
                href={item.rota}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                  ativo
                    ? "bg-white text-black"
                    : "hover:bg-zinc-900"
                }`}
              >

                <Icon size={22} />

                <span className="text-lg font-medium">
                  {item.nome}
                </span>

              </Link>
            )
          })}

        </nav>

      </div>

      {/* FOOTER */}

      <button className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-zinc-900 transition-all">

        <LogOut size={22} />

        <span className="text-lg font-medium">
          Sair
        </span>

      </button>

    </aside>
  )
}
