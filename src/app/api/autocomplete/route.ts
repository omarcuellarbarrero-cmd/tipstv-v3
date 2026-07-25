// app/api/autocomplete/route.ts
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
  const q = searchParams.get("q") || ""
  const field = searchParams.get("field") || ""
  const type = searchParams.get("type")
  const brand = searchParams.get("brand")
  const modelChassis = searchParams.get("modelChassis")

  if (!q || !field) {
    return NextResponse.json({ suggestions: [] })
  }

  const allowedFields = ["modelChassis", "symptom"]
  if (!allowedFields.includes(field)) {
    return NextResponse.json({ suggestions: [] })
  }

  const where: any = {}
  if (type) where.type = type
  if (brand) where.brand = brand
  if (modelChassis && field === "symptom") where.modelChassis = modelChassis

  where[field] = { contains: q, mode: "insensitive" }

  try {
    const results = await prisma.case.findMany({
      where,
      select: { [field]: true },
      distinct: [field as any],
      orderBy: { [field]: "asc" },
      take: 10,
    })

    const suggestions = results.map((r: any) => r[field])
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error en autocomplete:", error)
    return NextResponse.json({ suggestions: [] })
  }
}