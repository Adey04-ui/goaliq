import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

// Deliberately simple, dependency-free device labelling. Good enough to
// distinguish "Mobile" vs "Desktop" in the activity list; swap in a proper
// parser (e.g. ua-parser-js) if you want browser/OS-level detail later.
function getDeviceLabel(userAgent = "") {
  if (/mobile/i.test(userAgent)) return "Mobile"
  if (/tablet|ipad/i.test(userAgent)) return "Tablet"
  return "Desktop"
}

function getClientIp(headersList) {
  // Behind a proxy/load balancer (Vercel, etc.) the real client IP shows up
  // in x-forwarded-for as the first entry in a comma-separated chain, not
  // as a plain remote address you can read off the request directly.
  const forwardedFor = headersList.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0].trim()
  return headersList.get("x-real-ip") || null
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
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

    async signIn({ user }) {
      try {
        const headersList = headers()
        const userAgent = headersList.get("user-agent") || ""
        const ipAddress = getClientIp(headersList)
        const device = getDeviceLabel(userAgent)

        // Both writes together: lastLoginAt/lastLoginIp on the user record
        // for quick lookups, and a new LoginActivity row per sign-in so the
        // Settings page can show a real history instead of one entry that
        // silently gets nothing new appended to it.
        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date(), lastLoginIp: ipAddress },
          }),
          prisma.loginActivity.create({
            data: {
              userId: user.id,
              ipAddress,
              userAgent,
              device,
              // `location` is left null here - populating it needs an
              // IP-to-geo lookup (e.g. ipapi.co) which isn't wired up.
              // Add that separately if you want it filled in.
            },
          }),
        ])
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