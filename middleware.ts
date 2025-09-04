import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"

export async function middleware(request: NextRequest) {
  // Handle admin routes separately
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Allow admin login page
    if (request.nextUrl.pathname === "/admin/auth/login") {
      return NextResponse.next()
    }

    // Check admin session
    const adminSession = getAdminSession(request)

    if (!adminSession) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin/auth/login"
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  }

  // Handle regular user routes with Supabase
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
