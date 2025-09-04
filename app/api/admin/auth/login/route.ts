import { type NextRequest, NextResponse } from "next/server"
import { createAdminToken } from "@/lib/admin-auth"

const ADMIN_USERNAME = "master@admin.com"
const ADMIN_PASSWORD = "Mama4you@"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const isValidCredentials = username === ADMIN_USERNAME && password === ADMIN_PASSWORD

    if (!isValidCredentials) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = createAdminToken(username)

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    })

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
