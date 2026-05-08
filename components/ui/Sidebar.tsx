"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Sidebar() {

  const pathname = usePathname()

  const links = [
    {
      nome: "Dashboard",
      href: "/"
    },
    {
      nome: "Minhas Vendas",
      href: "/vendas"
    },
    {
      nome: "Pedidos do Dia",
      href: "/pedidos-dia"
    },
    {
      nome: "Pendentes",
      href: "/pendentes"
    },
    {
      nome: "Central Financeira",
      href: "/financeiro"
    }
  ]

  return (

    <aside className="w-64 min-h-screen bg-black text-white p-6">

      <h1 className="text-2xl font-bold mb-10">
        Dona Marmita
      </h1>

      <nav className="flex flex-col gap-3">

        {links.map((link) => (

          <Link
            key={link.href}
            href={link.href}
            className={`p-3 rounded-xl transition ${
              pathname === link.href
                ? "bg-white text-black"
                : "hover:bg-zinc-800"
            }`}
          >
            {link.nome}
          </Link>

        ))}

      </nav>

    </aside>
  )
}
