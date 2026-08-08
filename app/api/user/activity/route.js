import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    const activities = await prisma.loginActivity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
    })

    return Response.json({ success: true, activities })
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}