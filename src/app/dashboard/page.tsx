"use client"
import BackButton from "./BackButton";
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LogOut, Search, ArrowLeft, ExternalLink, List } from "lucide-react"
import { signOut } from "next-auth/react"
import Autocomplete from "@/components/Autocomplete"

interface CaseResult {
  id: string
  type: string
  brand: string
  modelChassis: string
  symptom: string
  descarte: string | null
  solution: string
  mediaLinks: string[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [type, setType] = useState("")
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [symptom, setSymptom] = useState("")

  const [types, setTypes] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])

  const [result, setResult] = useState<CaseResult | null>(null)
  const [partialResults, setPartialResults] = useState<CaseResult[]>([])
  const [showPartial, setShowPartial] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)

  const [allModels, setAllModels] = useState<string[]>([])
  const [showAllModels, setShowAllModels] = useState(false)
  const [allSymptoms, setAllSymptoms] = useState<string[]>([])
  const [showAllSymptoms, setShowAllSymptoms] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetch("/api/filters")
      .then((r) => r.json())
      .then((data) => setTypes(data.filters))
  }, [])
function App() {
  return (
    <div className="app">          {/* o <>, <main>, etc. */}
      <BackButton />               {/* ← PEGA AQUÍ, como primer hijo */}
      
      {/* ... todo lo demás de tu app */}
    </div>
  );
}
  useEffect(() => {
    if (!type) return
    setBrand("")
    setModel("")
    setSymptom("")
    setBrands([])
    setPartialResults([])
    setShowPartial(false)

    fetch(`/api/filters?type=${encodeURIComponent(type)}`)
      .then((r) => r.json())
      .then((data) => setBrands(data.filters))
  }, [type])

  async function handleSearch() {
    setLoading(true)
    setResult(null)
    setNotFound(false)
    setPartialResults([])
    setShowPartial(false)

    const res = await fetch(
      `/api/search?type=${encodeURIComponent(type)}&brand=${encodeURIComponent(brand)}&modelChassis=${encodeURIComponent(model)}&symptom=${encodeURIComponent(symptom)}`
    )

    const data = await res.json()

    if (data.found) {
      setResult(data.case)
    } else {
      setNotFound(true)
    }
    setLoading(false)
  }

  async function handleShowPartial() {
    setLoading(true)
    setResult(null)
    setNotFound(false)

    const url = model
      ? `/api/search-partial?type=${encodeURIComponent(type)}&brand=${encodeURIComponent(brand)}&modelChassis=${encodeURIComponent(model)}`
      : `/api/search-partial?type=${encodeURIComponent(type)}&brand=${encodeURIComponent(brand)}`

    const res = await fetch(url)
    const data = await res.json()

    if (data.cases && data.cases.length > 0) {
      setPartialResults(data.cases)
      setShowPartial(true)
    } else {
      setNotFound(true)
    }
    setLoading(false)
  }

  function resetSearch() {
    setStep(1)
    setType("")
    setBrand("")
    setModel("")
    setSymptom("")
    setResult(null)
    setPartialResults([])
    setShowPartial(false)
    setNotFound(false)
  }

  function goBack() {
    if (step > 1) {
      setStep(step - 1)
      if (step === 2) setType("")
      if (step === 3) setBrand("")
      if (step === 4) setModel("")
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10">
              <img
                src="https://omarcuellar.co/wp-content/uploads/logo-metodooc.png"
                alt="Método OC"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">TipsTV v3</h1>
              <p className="text-xs text-gray-500">Bienvenido, {session?.user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {session?.user?.role === "ADMIN" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin")}
              >
                Admin
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="w-4 h-4 mr-1" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {result && (
          <div className="mb-6">
            <Button variant="ghost" onClick={resetSearch} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Nueva búsqueda
            </Button>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Diagnóstico encontrado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-semibold">Tipo:</span> {result.type}</div>
                  <div><span className="font-semibold">Marca:</span> {result.brand}</div>
                  <div className="col-span-2"><span className="font-semibold">Modelo/Chasis:</span> {result.modelChassis}</div>
                  <div className="col-span-2"><span className="font-semibold">Síntoma:</span> {result.symptom}</div>
                </div>

                {result.descarte && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-1">Descarte / Causa:</h4>
                    <p className="text-yellow-900 whitespace-pre-wrap">{result.descarte}</p>
                  </div>
                )}

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Solución:</h4>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {result.solution}
                  </div>
                </div>

                {result.mediaLinks && result.mediaLinks.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Enlaces de referencia:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.mediaLinks.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Link {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {showPartial && partialResults.length > 0 && (
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setShowPartial(false)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a búsqueda
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="w-5 h-5" />
                  Tips encontrados ({partialResults.length})
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {type} → {brand} {model ? `→ ${model}` : ""}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {partialResults.map((c) => (
                  <div
                    key={c.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => {
                      setResult(c)
                      setShowPartial(false)
                      setPartialResults([])
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-800">{c.modelChassis}</div>
                        <div className="text-sm text-gray-600 mt-1">{c.symptom}</div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {c.type}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {notFound && (
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setNotFound(false)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Intentar de nuevo
            </Button>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-8 text-center">
                <div className="text-red-600 text-lg font-semibold mb-2">
                  No encontré información
                </div>
                <p className="text-red-700">
                  No hay casos registrados con esos datos.<br />
                  Verifica el modelo/chasis y el síntoma.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {!result && !showPartial && !notFound && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Buscar diagnóstico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-2 rounded-full ${
                      s <= step ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 text-center">
                Paso {step} de 4
              </p>

              {step === 1 && (
                <div className="space-y-4">
                  <label className="text-lg font-medium block">1. Selecciona el tipo de TV</label>
                  <Select value={type} onValueChange={(v) => { setType(v); setStep(2) }}>
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue placeholder="Selecciona tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((t) => (
                        <SelectItem key={t} value={t} className="text-lg py-3">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={goBack}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <label className="text-lg font-medium">2. Selecciona la marca</label>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">Tipo: {type}</div>
                  <Select value={brand} onValueChange={(v) => { setBrand(v); setStep(3) }}>
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue placeholder="Selecciona marca..." />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b} value={b} className="text-lg py-3">
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {brand && (
                    <Button
                      variant="outline"
                      className="w-full h-12 text-base"
                      onClick={handleShowPartial}
                    >
                      <List className="w-4 h-4 mr-2" />
                      Ver todos los tips de {brand}
                    </Button>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={goBack}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <label className="text-lg font-medium">3. Escribe el modelo/chasis</label>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">{type} → {brand}</div>

                  <div className="flex gap-2">
                    <Autocomplete
                      value={model}
                      onChange={setModel}
                      onSelect={() => setStep(4)}
                      field="modelChassis"
                      type={type}
                      brand={brand}
                      placeholder="Escribe el modelo/chasis..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-14 px-3"
                      title="Ver todos los modelos"
                      onClick={async () => {
                        const res = await fetch(
                          `/api/filters?type=${encodeURIComponent(type)}&brand=${encodeURIComponent(brand)}`
                        )
                        const data = await res.json()
                        setAllModels(data.filters || [])
                        setShowAllModels(true)
                      }}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>

                  {showAllModels && allModels.length > 0 && (
                    <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                      {allModels.map((m) => (
                        <div
                          key={m}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 transition"
                          onClick={() => {
                            setModel(m)
                            setShowAllModels(false)
                            setStep(4)
                          }}
                        >
                          <span className="text-lg">{m}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {model && (
                    <Button
                      variant="outline"
                      className="w-full h-12 text-base"
                      onClick={handleShowPartial}
                    >
                      <List className="w-4 h-4 mr-2" />
                      Ver todos los tips de {model}
                    </Button>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={goBack}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <label className="text-lg font-medium">4. Escribe el síntoma</label>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">{type} → {brand} → {model}</div>

                  <div className="flex gap-2">
                    <Autocomplete
                      value={symptom}
                      onChange={setSymptom}
                      field="symptom"
                      type={type}
                      brand={brand}
                      modelChassis={model}
                      placeholder="Escribe el síntoma (ej: Backlight, imagen, sonido)..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-14 px-3"
                      title="Ver todos los síntomas"
                      onClick={async () => {
                        const res = await fetch(
                          `/api/filters?type=${encodeURIComponent(type)}&brand=${encodeURIComponent(brand)}&modelChassis=${encodeURIComponent(model)}`
                        )
                        const data = await res.json()
                        setAllSymptoms(data.filters || [])
                        setShowAllSymptoms(true)
                      }}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>

                  {showAllSymptoms && allSymptoms.length > 0 && (
                    <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                      {allSymptoms.map((s) => (
                        <div
                          key={s}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 transition"
                          onClick={() => {
                            setSymptom(s)
                            setShowAllSymptoms(false)
                          }}
                        >
                          <span className="text-lg">{s}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={handleSearch}
                    disabled={!symptom || loading}
                    className="w-full h-14 text-lg mt-4"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    {loading ? "Buscando..." : "Buscar diagnóstico exacto"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
