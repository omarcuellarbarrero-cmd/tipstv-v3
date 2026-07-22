import { PrismaClient } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"
import { parse } from "csv-parse/sync"

const prisma = new PrismaClient()

function cleanMarca(val: string): string {
  if (!val) return "Genericos/Chinos"
  const v = val.toLowerCase().trim()

  if (v.includes("samsung")) return "Samsung"
  if (v.includes("lg")) return "LG"
  if (v.includes("sony")) return "Sony"
  if (v.includes("rca")) return "RCA"
  if (v.includes("panasonic")) return "Panasonic"
  if (v.includes("hisense")) return "Hisense"
  if (v.includes("tcl")) return "TCL"
  if (v.includes("genérico") || v.includes("generico") || v.includes("generic")) return "Genericos/Chinos"

  return "Genericos/Chinos"
}

function getTipo(marca: string, modelo: string): string {
  const text = (marca + " " + modelo).toLowerCase()
  if (text.includes("trc")) return "TRC"
  return "LCD/LED"
}

function cleanText(val: string | undefined): string {
  if (!val) return ""
  return val.trim().replace(/\s+/g, " ")
}

async function main() {
  const csvPath = path.join(__dirname, "casos_limpios.csv")

  if (!fs.existsSync(csvPath)) {
    console.error("❌ No se encontró scripts/casos_limpios.csv")
    console.log("Coloca tu archivo CSV en la carpeta scripts/")
    process.exit(1)
  }

  const fileContent = fs.readFileSync(csvPath, "utf-8")
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  })

  console.log(`📊 Encontrados ${records.length} registros en CSV`)

  let imported = 0
  let skipped = 0

  for (const record of records) {
    const marca = cleanMarca(record.MARCA || record.marca || "")
    const modelo = cleanText(record.MODELO || record.modelo || record.Modelo || "")
    const sintoma = cleanText(record.SINTOMA || record.sintoma || record.Sintoma || "")
    const descarte = cleanText(record.DESCARTE || record.descarte || record["DESCARTE / CAUSA"] || record["Descarte / Causa"] || "")
    const solucion = cleanText(record.SOLUCION || record.solucion || record.Solucion || "")
    const tipo = getTipo(marca, modelo)

    if (!sintoma) {
      console.log(`⚠️ Saltado: sin síntoma (${modelo})`)
      skipped++
      continue
    }

    const existing = await prisma.case.findFirst({
      where: {
        type: tipo,
        brand: marca,
        modelChassis: modelo,
        symptom: sintoma,
      },
    })

    if (existing) {
      console.log(`⚠️ Ya existe: ${marca} ${modelo}`)
      skipped++
      continue
    }

    await prisma.case.create({
      data: {
        type: tipo,
        brand: marca,
        modelChassis: modelo || "Sin modelo",
        symptom: sintoma,
        descarte: descarte || null,
        solution: solucion || "Sin solución documentada",
        mediaLinks: [],
      },
    })

    imported++
    console.log(`✅ Importado: ${marca} ${modelo}`)
  }

  console.log(`\n📈 Resumen:`)
  console.log(`   Importados: ${imported}`)
  console.log(`   Saltados: ${skipped}`)
  console.log(`   Total: ${records.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
