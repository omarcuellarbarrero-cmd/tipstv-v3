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

  if (!type || !brand) {
    return NextResponse.json(
      { error: "Se requiere tipo y marca" },
      { status: 400 }
    )
  }

  // Construir el where dinámicamente
  const where: any = { type, brand }
  if (modelChassis) {
    where.modelChassis = { equals: modelChassis, mode: "insensitive" }
  }

  const cases = await prisma.case.findMany({
    where,
    orderBy: [
      { modelChassis: "asc" },
      { symptom: "asc" },
    ],
  })

  return NextResponse.json({ cases })
}
