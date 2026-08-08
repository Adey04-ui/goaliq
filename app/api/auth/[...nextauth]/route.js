import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,      // 30 days
    updateAge: 24 * 60 * 60,         // extend session if older than 24h
  },

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },

    async signIn({ user, account, profile }) {
      try {

        // Update last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
          },
        })
      } catch (e) {
        // Don't block sign-in if logging fails
        console.error("Login activity log failed:", e)
      }

      return true
    },
  },

  pages: {
    error: "/auth/error",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }