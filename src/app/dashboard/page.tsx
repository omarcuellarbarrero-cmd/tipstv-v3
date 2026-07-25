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
  
  const [types, setTypes] = useState([])
  const [brands, setBrands] = useState([])
  
  const [result, setResult] = useState(null)
  const [partialResults, setPartialResults] = useState([])
  const [showPartial, setShowPartial] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Cargar tipos de TV
  useEffect(() => {
    fetch("/api/filters")
      .then((r) => r.json())
      .then((data) => setTypes(data.filters))
  }, [])

  // Cargar marcas cuando cambia el tipo
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

  // ✅ ELIMINADO: useEffect que cargaba todos los modelos
  // ✅ ELIMINADO: useEffect que cargaba todos los síntomas
  // Ahora el Autocomplete busca en tiempo real desde /api/autocomplete

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
      

        
Cargando...

      

    )
  }

  return (
    

      

        

          

            

              Método OC
            

            

              
TipsTV v3

              
Bienvenido, {session?.user?.name}


            

          

          

            {session?.user?.role === "ADMIN" && (
               router.push("/admin")}
              >
                Admin
              
            )}
             signOut({ callbackUrl: "/login" })}
            >
              
              Salir
            
          

        

      


      

        {result && (
          

            
              
              Nueva búsqueda
            
            
            
              
                
                  

                  Diagnóstico encontrado
                

              
              
                

                  
Tipo: {result.type}

                  
Marca: {result.brand}

                  
Modelo/Chasis: {result.modelChassis}

                  
Síntoma: {result.symptom}

                

                
                {result.descarte && (
                  

                    
Descarte / Causa:

                    
{result.descarte}


                  

                )}
                
                

                  
Solución:

                  

                    {result.solution}
                  

                

                
                {result.mediaLinks && result.mediaLinks.length > 0 && (
                  

                    
Enlaces de referencia:

                    

                      {result.mediaLinks.map((link, i) => (
                        
                          
                          Link {i + 1}
                        
                      ))}
                    

                  

                )}
              
            
          

        )}

        {showPartial && partialResults.length > 0 && (
          

             setShowPartial(false)} className="mb-4">
              
              Volver a búsqueda
            
            
            
              
                
                  
                  Tips encontrados ({partialResults.length})
                
                

                  {type} → {brand} {model ? `→ ${model}` : ""}
                


              
              
                {partialResults.map((c) => (
                  
 {
                      setResult(c)
                      setShowPartial(false)
                      setPartialResults([])
                    }}
                  >
                    

                      

                        
{c.modelChassis}

                        
{c.symptom}

                      

                      
                        {c.type}
                      
                    

                  

                ))}
              
            
          

        )}

        {notFound && (
          

             setNotFound(false)} className="mb-4">
              
              Intentar de nuevo
            
            
              
                

                  No encontré información
                

                

                  No hay casos registrados con esos datos.

                  Verifica el modelo/chasis y el síntoma.
                


              
            
          

        )}

        {!result && !showPartial && !notFound && (
          
            
              Buscar diagnóstico
            
            
              

                {[1, 2, 3, 4].map((s) => (
                  

                ))}
              

              

                Paso {step} de 4
              



              {step === 1 && (
                

                  1. Selecciona el tipo de TV
                  

                

              )}

              {step === 2 && (
                

                  

                    
                      
                    
                    2. Selecciona la marca
                  

                  
Tipo: {type}

                  

                  
                  {brand && (
                    
                      
                      Ver todos los tips de {brand}
                    
                  )}
                

              )}

              {step === 3 && (
                

                  

                    
                      
                    
                    3. Escribe el modelo/chasis
                  

                  
{type} → {brand}

                   setStep(4)}
                    field="modelChassis"
                    type={type}
                    brand={brand}
                    placeholder="Escribe el modelo/chasis..."
                  />
                  
                  {model && (
                    
                      
                      Ver todos los tips de {model}
                    
                  )}
                

              )}

              {step === 4 && (
                

                  

                    
                      
                    
                    4. Escribe el síntoma
                  

                  
{type} → {brand} → {model}

                  
                  
                  
                    

                    {loading ? "Buscando..." : "Buscar diagnóstico exacto"}
                  

                

              )}
            
          
        )}
      

    

  )
}