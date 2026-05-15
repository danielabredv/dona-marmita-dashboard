
"use client"

import Sidebar from "../../components/ui/Sidebar"

import { useMemo, useState } from "react"

import * as XLSX from "xlsx"

import {
  Upload,
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Trash2
} from "lucide-react"

export default function PlanilhasPage() {

  const [dados, setDados] = useState<any[]>([])

  const [valorMinimo, setValorMinimo] =
    useState("")

  const [busca, setBusca] =
    useState("")

  const [cidade, setCidade] =
    useState("")

  const [dataInicial, setDataInicial] =
    useState("")

  const [dataFinal, setDataFinal] =
    useState("")

  const [somenteUnicos, setSomenteUnicos] =
    useState(true)

  async function lerPlanilha(
    e: any
  ) {

    const arquivo =
      e.target.files[0]

    if (!arquivo) return

    const data =
      await arquivo.arrayBuffer()

    const workbook =
      XLSX.read(data)

    const nomePlanilha =
      workbook.SheetNames[0]

    const worksheet =
      workbook.Sheets[nomePlanilha]

    const json =
      XLSX.utils.sheet_to_json(
        worksheet
      )

    setDados(json)
  }

  function formatarTelefone(
    telefone: any
  ) {

    if (!telefone) return ""

    let numero = String(telefone)
      .replace(/\D/g, "")

    if (
      numero &&
      !numero.startsWith("55")
    ) {
      numero = `55${numero}`
    }

    return numero
  }

  function converterData(
    data: string
  ) {

    if (!data) return null

    const partes = data.split("/")

    if (partes.length !== 3)
      return null

    return new Date(
      `${partes[2]}-${partes[1]}-${partes[0]}`
    )
  }

  const dadosFiltrados = useMemo(() => {

    let resultado = [...dados]

    // BUSCA GERAL

    if (busca) {

      resultado = resultado.filter(
        (linha: any) =>

          JSON.stringify(linha)
            .toLowerCase()
            .includes(
              busca.toLowerCase()
            )
      )
    }

    // FILTRO VALOR

    if (valorMinimo) {

      resultado = resultado.filter(
        (linha: any) => {

          const valor =
            Number(
              String(
                linha["Valor total"] ||
                linha["valor"] ||
                linha["valor total"] ||
                0
              )
                .replace(".", "")
                .replace(",", ".")
            )

          return (
            valor >=
            Number(valorMinimo)
          )
        }
      )
    }

    // FILTRO CIDADE

    if (cidade) {

      resultado = resultado.filter(
        (linha: any) => {

          const endereco =
            String(
              linha["Endereço"] ||
              linha["endereco"] ||
              ""
            ).toLowerCase()

          return endereco.includes(
            cidade.toLowerCase()
          )
        }
      )
    }

    // FILTRO DATA

    if (dataInicial || dataFinal) {

      resultado = resultado.filter(
        (linha: any) => {

          const dataTexto =
            linha["Data"] ||
            linha["data"]

          const dataLinha =
            converterData(dataTexto)

          if (!dataLinha)
            return false

          const inicio =
            dataInicial
              ? new Date(dataInicial)
              : null

          const fim =
            dataFinal
              ? new Date(dataFinal)
              : null

          if (
            inicio &&
            dataLinha < inicio
          ) {
            return false
          }

          if (
            fim &&
            dataLinha > fim
          ) {
            return false
          }

          return true
        }
      )
    }

    // REMOVER DUPLICADOS

    if (somenteUnicos) {

      const telefones =
        new Set()

      resultado = resultado.filter(
        (linha: any) => {

          const telefone =
            formatarTelefone(
              linha["fone"] ||
              linha["celular"] ||
              linha["telefone"]
            )

          if (!telefone)
            return false

          if (
            telefones.has(telefone)
          ) {
            return false
          }

          telefones.add(telefone)

          return true
        }
      )
    }

    return resultado

  }, [
    dados,
    busca,
    valorMinimo,
    cidade,
    dataInicial,
    dataFinal,
    somenteUnicos
  ])

  function exportarPlanilha() {

    const dadosExportados =
      dadosFiltrados.map(
        (linha: any) => ({

          ...linha,

          celular:
            formatarTelefone(
              linha["fone"] ||
              linha["celular"] ||
              linha["telefone"]
            )

        })
      )

    const worksheet =
      XLSX.utils.json_to_sheet(
        dadosExportados
      )

    const workbook =
      XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Campanha"
    )

    XLSX.writeFile(
      workbook,
      "campanha-filtrada.xlsx"
    )
  }

  function limparFiltros() {

    setBusca("")
    setValorMinimo("")
    setCidade("")
    setDataInicial("")
    setDataFinal("")
    setSomenteUnicos(true)
  }

  return (

    <div className="flex min-h-screen bg-zinc-50">

      <Sidebar />

      <main className="flex-1 overflow-auto">

        <div className="p-10">

          {/* HEADER */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

            <div>

              <h1 className="text-5xl font-bold mb-2 text-zinc-900">

                Gerador de Planilhas

              </h1>

              <p className="text-zinc-500 text-lg">

                Sistema inteligente de campanhas e filtros

              </p>

            </div>

            <button
              onClick={exportarPlanilha}
              disabled={
                dadosFiltrados.length === 0
              }
              className="
                bg-black text-white
                px-6 py-4 rounded-2xl
                flex items-center gap-3
                hover:opacity-90
                transition-all
                disabled:opacity-40
                w-fit
              "
            >

              <Download size={20} />

              Exportar Excel

            </button>

          </div>

          {/* CARDS */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

            <div className="bg-white rounded-3xl p-7 border border-zinc-100 shadow-sm">

              <div className="flex items-center justify-between mb-4">

                <Users className="text-blue-600" />

                <span className="text-zinc-400 text-sm">
                  Clientes
                </span>

              </div>

              <h2 className="text-zinc-500 mb-2">
                Total Filtrado
              </h2>

              <p className="text-4xl font-bold text-zinc-900">
                {dadosFiltrados.length}
              </p>

            </div>

            <div className="bg-white rounded-3xl p-7 border border-zinc-100 shadow-sm">

              <div className="flex items-center justify-between mb-4">

                <DollarSign className="text-green-600" />

                <span className="text-zinc-400 text-sm">
                  Ticket
                </span>

              </div>

              <h2 className="text-zinc-500 mb-2">
                Valor Mínimo
              </h2>

              <p className="text-4xl font-bold text-green-600">
                R$ {valorMinimo || 0}
              </p>

            </div>

            <div className="bg-white rounded-3xl p-7 border border-zinc-100 shadow-sm">

              <div className="flex items-center justify-between mb-4">

                <FileSpreadsheet className="text-purple-600" />

                <span className="text-zinc-400 text-sm">
                  Campanha
                </span>

              </div>

              <h2 className="text-zinc-500 mb-2">
                Telefones Únicos
              </h2>

              <p className="text-4xl font-bold text-purple-600">
                {somenteUnicos
                  ? "SIM"
                  : "NÃO"}
              </p>

            </div>

          </div>

          {/* UPLOAD */}

          <div className="bg-white border border-zinc-100 rounded-3xl p-10 mb-10 shadow-sm">

            <div className="flex items-center gap-3 mb-6">

              <Upload className="text-zinc-700" />

              <h2 className="text-2xl font-bold">
                Upload da Planilha
              </h2>

            </div>

            <input
              type="file"
              accept=".xlsx,.csv,.xls"
              onChange={lerPlanilha}
              className="
                border border-zinc-200
                p-4 rounded-2xl
                w-full max-w-md
              "
            />

          </div>

          {/* FILTROS */}

          <div className="bg-white border border-zinc-100 rounded-3xl p-10 mb-10 shadow-sm">

            <div className="flex items-center justify-between mb-8">

              <div className="flex items-center gap-3">

                <Filter className="text-zinc-700" />

                <h2 className="text-2xl font-bold">
                  Filtros Inteligentes
                </h2>

              </div>

              <button
                onClick={limparFiltros}
                className="
                  bg-red-50 text-red-600
                  px-5 py-3 rounded-2xl
                  flex items-center gap-2
                  hover:bg-red-100
                "
              >

                <Trash2 size={18} />

                Limpar

              </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

              {/* BUSCA */}

              <div>

                <label className="text-sm text-zinc-500 mb-2 block">
                  Buscar Cliente
                </label>

                <div className="relative">

                  <Search
                    size={18}
                    className="absolute left-4 top-4 text-zinc-400"
                  />

                  <input
                    type="text"
                    value={busca}
                    onChange={(e) =>
                      setBusca(
                        e.target.value
                      )
                    }
                    placeholder="Pesquisar cliente..."
                    className="
                      w-full border border-zinc-200
                      rounded-2xl pl-12 pr-4 py-4
                      outline-none
                    "
                  />

                </div>

              </div>

              {/* VALOR */}

              <div>

                <label className="text-sm text-zinc-500 mb-2 block">
                  Valor Mínimo
                </label>

                <input
                  type="number"
                  value={valorMinimo}
                  onChange={(e) =>
                    setValorMinimo(
                      e.target.value
                    )
                  }
                  placeholder="300"
                  className="
                    w-full border border-zinc-200
                    rounded-2xl p-4
                    outline-none
                  "
                />

              </div>

              {/* CIDADE */}

              <div>

                <label className="text-sm text-zinc-500 mb-2 block">
                  Cidade
                </label>

                <div className="relative">

                  <MapPin
                    size={18}
                    className="absolute left-4 top-4 text-zinc-400"
                  />

                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) =>
                      setCidade(
                        e.target.value
                      )
                    }
                    placeholder="Salvador"
                    className="
                      w-full border border-zinc-200
                      rounded-2xl pl-12 pr-4 py-4
                      outline-none
                    "
                  />

                </div>

              </div>

              {/* DATA INICIAL */}

              <div>

                <label className="text-sm text-zinc-500 mb-2 block">
                  Data Inicial
                </label>

                <div className="relative">

                  <Calendar
                    size={18}
                    className="absolute left-4 top-4 text-zinc-400"
                  />

                  <input
                    type="date"
                    value={dataInicial}
                    onChange={(e) =>
                      setDataInicial(
                        e.target.value
                      )
                    }
                    className="
                      w-full border border-zinc-200
                      rounded-2xl pl-12 pr-4 py-4
                      outline-none
                    "
                  />

                </div>

              </div>

              {/* DATA FINAL */}

              <div>

                <label className="text-sm text-zinc-500 mb-2 block">
                  Data Final
                </label>

                <div className="relative">

                  <Calendar
                    size={18}
                    className="absolute left-4 top-4 text-zinc-400"
                  />

                  <input
                    type="date"
                    value={dataFinal}
                    onChange={(e) =>
                      setDataFinal(
                        e.target.value
                      )
                    }
                    className="
                      w-full border border-zinc-200
                      rounded-2xl pl-12 pr-4 py-4
                      outline-none
                    "
                  />

                </div>

              </div>

              {/* DUPLICADOS */}

              <div className="flex items-end">

                <label className="
                  flex items-center gap-3
                  bg-zinc-100 px-5 py-4
                  rounded-2xl cursor-pointer
                  w-full
                ">

                  <input
                    type="checkbox"
                    checked={somenteUnicos}
                    onChange={() =>
                      setSomenteUnicos(
                        !somenteUnicos
                      )
                    }
                  />

                  Remover Duplicados

                </label>

              </div>

            </div>

          </div>

          {/* PREVIEW */}

          {dadosFiltrados.length > 0 && (

            <div className="
              bg-white border border-zinc-100
              rounded-3xl p-10 shadow-sm
              overflow-auto
            ">

              <h2 className="text-3xl font-bold mb-8">
                Preview da Campanha
              </h2>

              <table className="min-w-full text-sm">

                <thead>

                  <tr className="border-b border-zinc-200 bg-zinc-50">

                    {Object.keys(
                      dadosFiltrados[0]
                    ).map((coluna) => (

                      <th
                        key={coluna}
                        className="
                          text-left p-4
                          font-bold text-zinc-700
                          whitespace-nowrap
                        "
                      >

                        {coluna}

                      </th>

                    ))}

                  </tr>

                </thead>

                <tbody>

                  {dadosFiltrados.map(
                    (
                      linha: any,
                      index
                    ) => (

                      <tr
                        key={index}
                        className="
                          border-b border-zinc-100
                          hover:bg-zinc-50
                        "
                      >

                        {Object.values(linha).map(
                          (
                            valor: any,
                            i
                          ) => (

                            <td
                              key={i}
                              className="p-4 whitespace-nowrap"
                            >

                              {String(valor)}

                            </td>

                          )
                        )}

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

    </div>
  )
}

