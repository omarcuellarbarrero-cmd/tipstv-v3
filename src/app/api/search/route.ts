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
  const symptom = searchParams.get("symptom")

  if (!type || !brand || !modelChassis || !symptom) {
    return NextResponse.json(
      { error: "Faltan parámetros de búsqueda" },
      { status: 400 }
    )
  }

  const result = await prisma.case.findFirst({
    where: {
      type,
      brand,
      modelChassis: { equals: modelChassis, mode: "insensitive" },
      symptom: { equals: symptom, mode: "insensitive" },
    },
  })

  if (!result) {
    return NextResponse.json(
      {
        found: false,
        message: "No encontré información con esos datos. Verifica el modelo/chasis y el síntoma.",
      },
      { status: 404 }
    )
  }

  return NextResponse.json({ found: true, case: result })
}
