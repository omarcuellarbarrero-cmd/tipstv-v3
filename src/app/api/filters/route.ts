import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const brand = searchParams.get("brand")
  const modelChassis = searchParams.get("modelChassis")

  if (!type) {
    const types = await prisma.case.findMany({
      select: { type: true },
      distinct: ["type"],
      orderBy: { type: "asc" },
    })
    return NextResponse.json({ filters: types.map((t: { type: string }) => t.type) })
  }

  if (type && !brand) {
    const brands = await prisma.case.findMany({
      where: { type },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    })
    return NextResponse.json({ filters: brands.map((b: { brand: string }) => b.brand) })
  }

  if (type && brand && !modelChassis) {
    const models = await prisma.case.findMany({
      where: { type, brand },
      select: { modelChassis: true },
      distinct: ["modelChassis"],
      orderBy: { modelChassis: "asc" },
    })
    return NextResponse.json({ filters: models.map((m: { modelChassis: string }) => m.modelChassis) })
  }

  if (type && brand && modelChassis) {
    const symptoms = await prisma.case.findMany({
      where: { type, brand, modelChassis },
      select: { symptom: true },
      distinct: ["symptom"],
      orderBy: { symptom: "asc" },
    })
    return NextResponse.json({ filters: symptoms.map((s: { symptom: string }) => s.symptom) })
  }

  return NextResponse.json({ filters: [] })
}
