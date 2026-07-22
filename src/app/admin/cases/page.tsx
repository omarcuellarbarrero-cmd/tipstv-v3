"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Plus, Search, Trash2, Pencil, X } from "lucide-react"

interface Case {
  id: string
  type: string
  brand: string
  modelChassis: string
  symptom: string
  descarte: string | null
  solution: string
  mediaLinks: string[]
}

export default function AdminCasesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [editingCase, setEditingCase] = useState<Case | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newLink, setNewLink] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    type: "LCD/LED",
    brand: "",
    modelChassis: "",
    symptom: "",
    descarte: "",
    solution: "",
    mediaLinks: [] as string[],
  })

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (session?.user?.role !== "ADMIN") router.push("/dashboard")
  }, [status, session, router])

  useEffect(() => {
    loadCases()
  }, [page, search])

  async function loadCases() {
    setLoading(true)
    const res = await fetch(`/api/cases?page=${page}&search=${encodeURIComponent(search)}`)
    const data = await res.json()
    setCases(data.cases || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  function resetForm() {
    setFormData({
      type: "LCD/LED",
      brand: "",
      modelChassis: "",
      symptom: "",
      descarte: "",
      solution: "",
      mediaLinks: [],
    })
    setNewLink("")
    setEditingCase(null)
  }

  function startEdit(c: Case) {
    setEditingCase(c)
    setFormData({
      type: c.type,
      brand: c.brand,
      modelChassis: c.modelChassis,
      symptom: c.symptom,
      descarte: c.descarte || "",
      solution: c.solution,
      mediaLinks: c.mediaLinks || [],
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const url = editingCase ? `/api/cases/${editingCase.id}` : "/api/cases"
    const method = editingCase ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      setIsDialogOpen(false)
      resetForm()
      loadCases()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este caso permanentemente?")) return

    const res = await fetch(`/api/cases/${id}`, { method: "DELETE" })
    if (res.ok) loadCases()
  }

  function addLink() {
    if (!newLink.trim()) return
    setFormData({
      ...formData,
      mediaLinks: [...formData.mediaLinks, newLink.trim()],
    })
    setNewLink("")
  }

  function removeLink(index: number) {
    setFormData({
      ...formData,
      mediaLinks: formData.mediaLinks.filter((_, i) => i !== index),
    })
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
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="font-bold text-lg">Casos de Reparación</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo caso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCase ? "Editar caso" : "Nuevo caso"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) => setFormData({ ...formData, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRC">TRC</SelectItem>
                        <SelectItem value="LCD/LED">LCD/LED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Marca</Label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Samsung"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Modelo / Chasis</Label>
                  <Input
                    value={formData.modelChassis}
                    onChange={(e) => setFormData({ ...formData, modelChassis: e.target.value })}
                    placeholder="UN40J5200 / BN41-02528"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Síntoma</Label>
                  <Input
                    value={formData.symptom}
                    onChange={(e) => setFormData({ ...formData, symptom: e.target.value })}
                    placeholder="No enciende, pantalla negra..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descarte / Causa</Label>
                  <textarea
                    value={formData.descarte}
                    onChange={(e) => setFormData({ ...formData, descarte: e.target.value })}
                    placeholder="Qué medir, qué descartar..."
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Solución</Label>
                  <textarea
                    value={formData.solution}
                    onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                    placeholder="Pasos para resolver..."
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Enlaces de referencia</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      placeholder="https://..."
                    />
                    <Button type="button" onClick={addLink} variant="outline">
                      Agregar
                    </Button>
                  </div>
                  {formData.mediaLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.mediaLinks.map((link: string, i: number) => (
                        <div key={i} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-sm">
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 truncate max-w-[200px]">
                            Link {i + 1}
                          </a>
                          <button type="button" onClick={() => removeLink(i)} className="text-red-500 ml-1">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  {editingCase ? "Guardar cambios" : "Crear caso"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por marca, modelo o síntoma..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <>
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Marca</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Modelo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Síntoma</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cases.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{c.type}</td>
                      <td className="px-4 py-3 text-sm font-medium">{c.brand}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[200px]">{c.modelChassis}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[250px]">{c.symptom}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(c)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {cases.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No se encontraron casos
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Mostrando {cases.length} de {total} casos
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page * 20 >= total}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
