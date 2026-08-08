import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json({ message: "Not authenticated" }, { status: 401 })
    }

    let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    // Auto-create free tier if missing
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan: "free",
          status: "active",
        },
      })
    }

    return Response.json({ success: true, subscription })
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}