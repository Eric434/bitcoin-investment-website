"use client"
import { Button } from "@/components/ui/button"

export function AdminSignOutButton() {
  const handleSignOut = () => {
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = "/admin/auth/login"
  }

  return (
    <Button variant="outline" onClick={handleSignOut}>
      Sign Out
    </Button>
  )
}
