import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@tipstv.com"
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123456"

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Administrador",
        password: hashedPassword,
        role: "ADMIN",
        active: true,
      },
    })

    console.log("✅ Admin creado:", adminEmail)
  } else {
    console.log("ℹ️ Admin ya existe:", adminEmail)
  }

  console.log("✅ Seed completado")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
