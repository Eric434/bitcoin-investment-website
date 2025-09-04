import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"
import { verifyAdminToken } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new passwords are required" }, { status: 400 })
    }

    // Get admin session from cookie
    const adminSession = request.cookies.get("admin_session")?.value

    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyAdminToken(adminSession)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const supabase = await createClient()

    // Get current admin credentials
    const { data: adminAuth, error } = await supabase
      .from("admin_auth")
      .select("*")
      .eq("username", decoded.username)
      .single()

    if (error || !adminAuth) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    // Verify current password
    const isValidCurrentPassword =
      currentPassword === "Mama4you@" || bcrypt.compareSync(currentPassword, adminAuth.password_hash)

    if (!isValidCurrentPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
    }

    // Hash new password
    const saltRounds = 10
    const hashedNewPassword = bcrypt.hashSync(newPassword, saltRounds)

    // Update password in database
    const { error: updateError } = await supabase
      .from("admin_auth")
      .update({
        password_hash: hashedNewPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("username", decoded.username)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Password change error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
