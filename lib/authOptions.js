
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

function getDeviceLabel(userAgent = "") {
  if (/mobile/i.test(userAgent)) return "Mobile";
  if (/tablet|ipad/i.test(userAgent)) return "Tablet";
  return "Desktop";
}

function getClientIp(headersList) {
  const forwardedFor = headersList.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return headersList.get("x-real-ip") || null;
}

const PRIVATE_IP_PATTERN =
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|::1$)/;

async function getLocationFromIp(ip) {
  if (!ip || PRIVATE_IP_PATTERN.test(ip)) {
    return null;
  }

  try {
    const res = await fetch(
      `https://ipwho.is/${encodeURIComponent(ip)}`
    );

    if (!res.ok) return null;

    const data = await res.json();

    if (!data.success) return null;

    return [data.city, data.region, data.country]
      .filter(Boolean)
      .join(", ");
  } catch (error) {
    console.error("IP geolocation lookup failed:", error);
    return null;
  }
}

function LoggingPrismaAdapter(prismaClient) {
  const base = PrismaAdapter(prismaClient);

  return {
    ...base,

    async createSession(session) {
      const created = await base.createSession(session);

      try {
        const headersList = await headers();
        const userAgent = headersList.get("user-agent") || "";
        const ipAddress = getClientIp(headersList);
        const device = getDeviceLabel(userAgent);
        const location = await getLocationFromIp(ipAddress);

        await prismaClient.$transaction([
          prismaClient.user.update({
            where: { id: session.userId },
            data: {
              lastLoginAt: new Date(),
              lastLoginIp: ipAddress,
            },
          }),

          prismaClient.loginActivity.create({
            data: {
              userId: session.userId,
              ipAddress,
              userAgent,
              device,
              location,
              sessionToken: session.sessionToken,
            },
          }),
        ]);
      } catch (error) {
        console.error("Login activity log failed:", error);
      }

      return created;
    },

    async deleteSession(sessionToken) {
      try {
        await prismaClient.loginActivity.updateMany({
          where: { sessionToken },
          data: { deleted: true },
        });
      } catch (error) {
        console.error("Login activity cleanup failed:", error);
      }

      return base.deleteSession(sessionToken);
    },
  };
}

export const authOptions = {
  adapter: LoggingPrismaAdapter(prisma),

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
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
  ],

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }

      return session;
    },
  },

  pages: {
    error: "/auth/error",
  },
};