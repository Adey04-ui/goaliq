import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req) {
  try {
    const body = await req.json()

    const { username, email, password } = body

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return Response.json(
        { message: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    })

    return Response.json(user)
  } catch (error) {
    return Response.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}