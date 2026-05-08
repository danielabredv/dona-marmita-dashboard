"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")

  async function fazerLogin() {

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    })

    if (error) {
      alert("Email ou senha inválidos")
      return
    }

    router.push("/")
  }

  return (

    <main className="min-h-screen bg-zinc-100 flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-zinc-200">

        {/* LOGO / TÍTULO */}

        <div className="text-center mb-10">

          <div className="w-20 h-20 mx-auto rounded-3xl bg-black text-white flex items-center justify-center text-3xl font-bold mb-5 shadow-lg">
            D
          </div>

          <h1 className="text-4xl font-bold text-zinc-900">
            Dona Marmita
          </h1>

          <p className="text-zinc-500 mt-2">
            Dashboard de Gestão
          </p>

        </div>

        {/* FORMULÁRIO */}

        <div className="flex flex-col gap-5">

          <div>

            <label className="text-sm font-medium text-zinc-600 mb-2 block">
              Email
            </label>

            <input
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-zinc-300 focus:border-black focus:outline-none p-4 rounded-2xl transition"
            />

          </div>

          <div>

            <label className="text-sm font-medium text-zinc-600 mb-2 block">
              Senha
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-zinc-300 focus:border-black focus:outline-none p-4 rounded-2xl transition"
            />

          </div>

          <button
            onClick={fazerLogin}
            className="bg-black text-white p-4 rounded-2xl font-semibold hover:opacity-90 transition"
          >
            Entrar no Sistema
          </button>

        </div>

        {/* RODAPÉ */}

        <div className="mt-8 text-center text-sm text-zinc-500">
          Dona Marmita © 2026
        </div>

      </div>

    </main>

  )
}