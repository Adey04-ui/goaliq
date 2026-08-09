import { v2 as cloudinary } from "cloudinary"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json({ message: "Not authenticated" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file")

    if (!file) {
      return Response.json({ message: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return Response.json({ message: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ message: "Image must be under 5MB" }, { status: 400 })
    }

    // Convert to buffer for Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "goaliq/avatars",
          public_id: `user_${session.user.id}`,
          overwrite: true,
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    // Update user in database
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: result.secure_url },
      select: {
        id: true,
        image: true,
        name: true,
        email: true,
        country: true,
        language: true,
        timezone: true,
        defaultMatchView: true,
        dataSaver: true,
        autoPlayVideos: true,
        showPlayerRatings: true,
        theme: true,
        lastLoginAt: true,
        // include new notification fields too
        matchReminders: true,
        goalAlerts: true,
        redCardAlerts: true,
        halfTimeScores: true,
        fullTimeScores: true,
        newsAlerts: true,
        transferAlerts: true,
        pushEnabled: true,
        emailEnabled: true,
        quietHoursEnabled: true,
      },
    })

    return Response.json({ success: true, user: updated })
  } catch (error) {
    console.error("Upload error:", error)
    return Response.json(
      { message: error.message || "Upload failed" },
      { status: 500 }
    )
  }
}