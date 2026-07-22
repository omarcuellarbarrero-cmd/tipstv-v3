import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - Listar casos
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const search = searchParams.get("search") || ""

  const where = search
    ? {
        OR: [
          { brand: { contains: search, mode: "insensitive" as const } },
          { modelChassis: { contains: search, mode: "insensitive" as const } },
          { symptom: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {}

  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.case.count({ where }),
  ])

  return NextResponse.json({ cases, total, page, limit })
}

// POST - Crear caso
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { type, brand, modelChassis, symptom, descarte, solution, mediaLinks } = body

    const newCase = await prisma.case.create({
      data: {
        type,
        brand,
        modelChassis,
        symptom,
        descarte: descarte || null,
        solution,
        mediaLinks: mediaLinks || [],
      },
    })

    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear el caso" },
      { status: 500 }
    )
  }
}
