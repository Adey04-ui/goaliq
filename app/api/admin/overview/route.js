
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      admin: {
        id: session.user.id,
        email: session.user.email,
      },
      message: "Admin authorization successful",
    });
  } catch (error) {
    console.error("Admin overview authorization failed:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}