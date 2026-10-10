
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const adminEmails = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

export async function getAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  if (!adminEmails.has(session.user.email.trim().toLowerCase())) {
    return null;
  }

  return session;
}