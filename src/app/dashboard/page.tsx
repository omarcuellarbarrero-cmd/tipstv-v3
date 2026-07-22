"use client"

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
import { LogOut, Search, Wrench, ArrowLeft, ExternalLink } from "lucide-react"
import { signOut } from "next-auth/react"

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
  const [models, setModels] = useState<string[]>([])
  const [symptoms, setSymptoms] = useState<string[]>([])

  const [result, setResult] = useState<CaseResult | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Cargar tipos al inicio
  useEffect(() => {
    fetch("/api/filters")
      .then((r) => r.json())
      .then((data) => setTypes(data.filters))
  }, [])

  // Cargar marcas cuando cambia tipo
  useEffect(() => {
    if (!type) return
    setBrand("")
    setModel("")
    setSymptom("")
    setBrands([])
    setModels([])
    setSymptoms([])

    fetch(`/api/filters?type=${encodeURIComponent(type)}`)
      .then((r) => r.json())
      .then((data) => setBrands(data.filters))
  }, [type])

  // Cargar modelos cuando cambia marca
  useEffect(() => {
    if (!type || !brand) return
    setModel("")
    setSymptom("")
    setModels([])
    setSymptoms([])

    fetch(`/api/filters?type=${encodeURIComponent(type)}&brand=${encodeURIComponent(brand)}`)
      .then((r) => r.json())
      .then((data) => setModels(data.filters))
  }, [brand, type])

  // Cargar síntomas cuando cambia modelo
  useEffect(() => {
    if (!type || !brand || !model) return
    setSymptom("")
    setSymptoms([])

    fetch(`/api/filters?type=${encodeURIComponent(type)}&brand=${encodeURIComponent(brand)}&modelChassis=${encodeURIComponent(model)}`)
      .then((r) => r.json())
      .then((data) => setSymptoms(data.filters))
  }, [model, brand, type])

  async function handleSearch() {
    setLoading(true)
    setResult(null)
    setNotFound(false)

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

  function resetSearch() {
    setStep(1)
    setType("")
    setBrand("")
    setModel("")
    setSymptom("")
    setResult(null)
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
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
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
        {/* Resultado */}
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

        {/* No encontrado */}
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
                  No hay casos registrados con esos datos exactos.<br />
                  Verifica el modelo/chasis y el síntoma.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Buscador paso a paso */}
        {!result && !notFound && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Buscar diagnóstico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Indicador de pasos */}
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

              {/* Paso 1: Tipo */}
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

              {/* Paso 2: Marca */}
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
                </div>
              )}

              {/* Paso 3: Modelo */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={goBack}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <label className="text-lg font-medium">3. Selecciona modelo/chasis</label>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">{type} → {brand}</div>
                  <Select value={model} onValueChange={(v) => { setModel(v); setStep(4) }}>
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue placeholder="Selecciona modelo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((m) => (
                        <SelectItem key={m} value={m} className="text-lg py-3">
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Paso 4: Síntoma */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={goBack}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <label className="text-lg font-medium">4. Selecciona el síntoma</label>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">{type} → {brand} → {model}</div>
                  <Select value={symptom} onValueChange={(v) => { setSymptom(v) }}>
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue placeholder="Selecciona síntoma..." />
                    </SelectTrigger>
                    <SelectContent>
                      {symptoms.map((s) => (
                        <SelectItem key={s} value={s} className="text-lg py-3">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleSearch}
                    disabled={!symptom || loading}
                    className="w-full h-14 text-lg mt-4"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    {loading ? "Buscando..." : "Buscar diagnóstico"}
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
