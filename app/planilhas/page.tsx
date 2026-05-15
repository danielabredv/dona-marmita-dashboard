"use client"

import Sidebar from "@/components/ui/Sidebar"

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
  MapPin,
  Trash2,
  Crown,
  Phone,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Building2,
  MessageCircle,
} from "lucide-react"

export default function PlanilhasPage() {
  const [dados, setDados] = useState<any[]>([])

  const [busca, setBusca] = useState("")
  const [cidadeFiltro, setCidadeFiltro] =
    useState("")
  const [bairroFiltro, setBairroFiltro] =
    useState("")
  const [valorMinimo, setValorMinimo] =
    useState("")
  const [somenteVIP, setSomenteVIP] =
    useState(false)

  const [dataInicial, setDataInicial] =
    useState("")
  const [dataFinal, setDataFinal] =
    useState("")

  function formatarTelefone(
    telefone: any
  ) {

    if (!telefone)
      return ""

    let numero =
      String(telefone)
        .replace(/\D/g, "")

    if (
      numero.startsWith("0")
    ) {
      numero = numero.slice(1)
    }

    if (
      numero.startsWith("55")
    ) {
      return numero
    }

    return `55${numero}`
  }

  async function lerPlanilha(e: any) {
    const arquivo = e.target.files[0]

    if (!arquivo) return

    const data = await arquivo.arrayBuffer()

    const workbook = XLSX.read(data)

    const nomePlanilha = workbook.SheetNames[0]

    const worksheet =
      workbook.Sheets[nomePlanilha]

    const json =
      XLSX.utils.sheet_to_json(worksheet)

    const dadosTratados = json.map(
      (item: any) => {

        const telefoneOriginal =
          item.telefone ||
          item.Telefone ||
          item.celular ||
          item.Celular ||
          item.fone ||
          item.Fone ||
          ""

        const telefoneFinal =
          formatarTelefone(
            telefoneOriginal
          )

        // DETECÇÃO INTELIGENTE DE ENDEREÇO

        const enderecoCompleto = String(
          item.endereco ||
          item.Endereco ||
          item.endereço ||
          item.Endereço ||
          ""
        )

        const enderecoLower =
          enderecoCompleto.toLowerCase()

        // TENTATIVA AUTOMÁTICA DE PEGAR CIDADE

        let cidade = ""

        const cidadesConhecidas = [
          "lagarto",
          "salvador",
          "aracaju",
          "são paulo",
          "rio de janeiro",
          "feira de santana",
          "itabaiana",
          "simão dias",
          "socorro",
        ]

        cidadesConhecidas.forEach(
          (cidadeTeste) => {

            if (
              enderecoLower.includes(
                cidadeTeste
              )
            ) {
              cidade = cidadeTeste
            }
          }
        )

        // BAIRRO

        const partesEndereco =
          enderecoCompleto.split(",")

        const bairro =
          partesEndereco[1]?.trim() || ""

        // VALOR

                // VALOR

        const valorOriginal =
          item["Valor total"] ??
          item["valor total"] ??
          item["Valor"] ??
          item["valor"] ??
          item["Total"] ??
          item["total"] ??
          0

        let valor = 0

        if (
          typeof valorOriginal ===
          "number"
        ) {

          valor = valorOriginal

        } else {

          valor = Number(
            String(valorOriginal)
              .replace("R$", "")
              .replace(/\s/g, "")
              .replace(/\./g, "")
              .replace(",", ".")
          ) || 0
        }

        const vip = valor >= 300

        // DATA

        const dataPedido =
          item.data ||
          item.Data ||
          item.created_at ||
          ""

        return {
          ...item,

          telefone: telefoneFinal,

          cidade,

          bairro,

          valor,

          vip,

          dataPedido,

          telefoneValido:
            telefoneFinal.length >= 12,
        }
      }
    )

    // REMOVER DUPLICADOS

    const removerDuplicados =
      dadosTratados.filter(
        (
          item: any,
          index: number,
          self: any[]
        ) =>
          index ===
          self.findIndex(
            (i: any) =>
              i.telefone === item.telefone
          )
      )

    setDados(removerDuplicados)
  }

  const dadosFiltrados = useMemo(() => {

    return dados.filter((item: any) => {

      const texto =
        JSON.stringify(item).toLowerCase()

      const buscaOk =
        texto.includes(
          busca.toLowerCase()
        )

      const cidadeOk = cidadeFiltro
        ? item.cidade
            ?.toLowerCase()
            .includes(
              cidadeFiltro.toLowerCase()
            )
        : true

      const bairroOk = bairroFiltro
        ? item.bairro
            ?.toLowerCase()
            .includes(
              bairroFiltro.toLowerCase()
            )
        : true

            // FILTRO VALOR

      const minimo =
        Number(valorMinimo) || 0

      const valorItem =
        Number(item.valor) || 0

      const valorOk =
        minimo > 0
          ? valorItem >= minimo
          : true

      const vipOk = somenteVIP
        ? item.vip
        : true

      // FILTRO DATA

      let dataOk = true

      if (
        dataInicial &&
        item.dataPedido
      ) {

        const dataItem =
          new Date(item.dataPedido)

        const inicio =
          new Date(dataInicial)

        dataOk =
          dataItem >= inicio
      }

      if (
        dataFinal &&
        item.dataPedido
      ) {

        const dataItem =
          new Date(item.dataPedido)

        const fim =
          new Date(dataFinal)

        dataOk =
          dataItem <= fim
      }

      return (
        buscaOk &&
        cidadeOk &&
        bairroOk &&
        valorOk &&
        vipOk &&
        dataOk
      )
    })

  }, [
    dados,
    busca,
    cidadeFiltro,
    bairroFiltro,
    valorMinimo,
    somenteVIP,
    dataInicial,
    dataFinal,
  ])

  function exportarPlanilha() {

    const worksheet =
      XLSX.utils.json_to_sheet(
        dadosFiltrados
      )

    const workbook =
      XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Clientes"
    )

    XLSX.writeFile(
      workbook,
      `clientes-filtrados-${Date.now()}.xlsx`
    )
  }

  // EXPORTAÇÃO WHATSAPP

  function exportarWhatsApp() {

    const numeros =
      dadosFiltrados
        .map(
          (item: any) =>
            item.telefone
        )
        .filter(Boolean)
        .join("\n")

    const blob = new Blob(
      [numeros],
      { type: "text/plain" }
    )

    const link =
      document.createElement("a")

    link.href =
      URL.createObjectURL(blob)

    link.download =
      "numeros-whatsapp.txt"

    link.click()
  }

  function limparFiltros() {

    setBusca("")
    setCidadeFiltro("")
    setBairroFiltro("")
    setValorMinimo("")
    setSomenteVIP(false)
    setDataInicial("")
    setDataFinal("")
  }

  const totalClientes =
    dadosFiltrados.length

  const totalVIP =
    dadosFiltrados.filter(
      (item: any) => item.vip
    ).length

  const totalValidos =
    dadosFiltrados.filter(
      (item: any) =>
        item.telefoneValido
    ).length

  const totalInvalidos =
    dadosFiltrados.filter(
      (item: any) =>
        !item.telefoneValido
    ).length

  const faturamento =
    dadosFiltrados.reduce(
      (acc: number, item: any) =>
        acc + item.valor,
      0
    )

  return (
    <div className="flex min-h-screen bg-zinc-100 text-black">

      <Sidebar />

      <main className="flex-1 p-10 overflow-auto">

        {/* HEADER */}

        <div className="mb-10">

          <div className="flex items-center gap-4 mb-4">

            <div className="bg-green-100 p-4 rounded-3xl">

              <FileSpreadsheet className="w-10 h-10 text-green-600" />

            </div>

            <div>

              <h1 className="text-5xl font-black">

                Central de Planilhas

              </h1>

              <p className="text-zinc-500 mt-2 text-lg">

                Sistema inteligente de campanhas e leads

              </p>

            </div>

          </div>

        </div>

        {/* CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-10">

          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">

            <div className="flex justify-between">

              <div>

                <p className="text-zinc-500">

                  Clientes

                </p>

                <h2 className="text-4xl font-black mt-2">

                  {totalClientes}

                </h2>

              </div>

              <Users className="w-10 h-10 text-blue-500" />

            </div>

          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">

            <div className="flex justify-between">

              <div>

                <p className="text-zinc-500">

                  VIP

                </p>

                <h2 className="text-4xl font-black mt-2 text-yellow-500">

                  {totalVIP}

                </h2>

              </div>

              <Crown className="w-10 h-10 text-yellow-500" />

            </div>

          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">

            <div className="flex justify-between">

              <div>

                <p className="text-zinc-500">

                  Telefones válidos

                </p>

                <h2 className="text-4xl font-black mt-2 text-green-600">

                  {totalValidos}

                </h2>

              </div>

              <CheckCircle2 className="w-10 h-10 text-green-600" />

            </div>

          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">

            <div className="flex justify-between">

              <div>

                <p className="text-zinc-500">

                  Inválidos

                </p>

                <h2 className="text-4xl font-black mt-2 text-red-500">

                  {totalInvalidos}

                </h2>

              </div>

              <AlertTriangle className="w-10 h-10 text-red-500" />

            </div>

          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">

            <div className="flex justify-between">

              <div>

                <p className="text-zinc-500">

                  Faturamento

                </p>

                <h2 className="text-3xl font-black mt-2 text-emerald-600">

                  R$ {faturamento.toFixed(2)}

                </h2>

              </div>

              <DollarSign className="w-10 h-10 text-emerald-600" />

            </div>

          </div>

        </div>

        {/* UPLOAD */}

        <div className="bg-white border border-zinc-200 rounded-3xl p-8 mb-10 shadow-sm">

          <div className="flex items-center gap-3 mb-6">

            <Upload className="w-7 h-7 text-green-600" />

            <h2 className="text-2xl font-bold">

              Upload da Planilha

            </h2>

          </div>

          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={lerPlanilha}
            className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl p-5"
          />

        </div>

        {/* FILTROS */}

        <div className="bg-white border border-zinc-200 rounded-3xl p-8 mb-10 shadow-sm">

          <div className="flex items-center gap-3 mb-8">

            <Sparkles className="w-7 h-7 text-yellow-500" />

            <h2 className="text-2xl font-bold">

              Filtros Inteligentes

            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5">

            <input
              value={busca}
              onChange={(e) =>
                setBusca(e.target.value)
              }
              placeholder="Buscar cliente..."
              className="bg-zinc-50 border border-zinc-300 rounded-2xl p-4"
            />

            <input
              value={cidadeFiltro}
              onChange={(e) =>
                setCidadeFiltro(
                  e.target.value
                )
              }
              placeholder="Cidade"
              className="bg-zinc-50 border border-zinc-300 rounded-2xl p-4"
            />

            <input
              value={bairroFiltro}
              onChange={(e) =>
                setBairroFiltro(
                  e.target.value
                )
              }
              placeholder="Bairro"
              className="bg-zinc-50 border border-zinc-300 rounded-2xl p-4"
            />

            <input
              type="number"
              value={valorMinimo}
              onChange={(e) =>
                setValorMinimo(
                  e.target.value
                )
              }
              placeholder="Valor mínimo"
              className="bg-zinc-50 border border-zinc-300 rounded-2xl p-4"
            />

            <input
              type="date"
              value={dataInicial}
              onChange={(e) =>
                setDataInicial(
                  e.target.value
                )
              }
              className="bg-zinc-50 border border-zinc-300 rounded-2xl p-4"
            />

            <input
              type="date"
              value={dataFinal}
              onChange={(e) =>
                setDataFinal(
                  e.target.value
                )
              }
              className="bg-zinc-50 border border-zinc-300 rounded-2xl p-4"
            />

          </div>

          {/* BOTÕES */}

          <div className="flex flex-wrap gap-4 mt-8">

            <button
              onClick={exportarPlanilha}
              className="bg-green-600 hover:bg-green-500 transition-all px-6 py-4 rounded-2xl font-bold flex items-center gap-3 text-white"
            >

              <Download className="w-5 h-5" />

              Exportar XLSX

            </button>

            <button
              onClick={exportarWhatsApp}
              className="bg-green-500 hover:bg-green-400 transition-all px-6 py-4 rounded-2xl font-bold flex items-center gap-3 text-white"
            >

              <MessageCircle className="w-5 h-5" />

              Exportar WhatsApp

            </button>

            <button
              onClick={() =>
                setSomenteVIP(
                  !somenteVIP
                )
              }
              className={`px-6 py-4 rounded-2xl font-bold transition-all ${
                somenteVIP
                  ? "bg-yellow-400 text-black"
                  : "bg-zinc-200"
              }`}
            >

              Somente VIP

            </button>

            <button
              onClick={limparFiltros}
              className="bg-red-500 hover:bg-red-400 transition-all px-6 py-4 rounded-2xl font-bold flex items-center gap-3 text-white"
            >

              <Trash2 className="w-5 h-5" />

              Limpar

            </button>

          </div>

        </div>

        {/* TABELA */}

        {dadosFiltrados.length > 0 && (

          <div className="bg-white border border-zinc-200 rounded-3xl p-8 overflow-auto shadow-sm">

            <div className="flex items-center justify-between mb-8">

              <div>

                <h2 className="text-3xl font-black">

                  Leads Carregados

                </h2>

                <p className="text-zinc-500 mt-2">

                  Clientes prontos para campanhas

                </p>

              </div>

              <TrendingUp className="w-8 h-8 text-green-500" />

            </div>

            <table className="min-w-full">

              <thead>

                <tr className="border-b border-zinc-200">

                  {Object.keys(
                    dadosFiltrados[0]
                  ).map((coluna) => (

                    <th
                      key={coluna}
                      className="text-left p-4 text-zinc-500 uppercase text-xs"
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
                      className="border-b border-zinc-100 hover:bg-zinc-50 transition-all"
                    >

                      {Object.values(
                        linha
                      ).map(
                        (
                          valor: any,
                          i
                        ) => (

                          <td
                            key={i}
                            className="p-4 text-sm whitespace-nowrap"
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

      </main>

    </div>
  )
}
