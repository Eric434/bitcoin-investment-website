export function createAdminToken(username: string) {
  const payload = {
    username,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    iat: Date.now(),
  }

  // Simple base64 encoding for browser compatibility
  return btoa(JSON.stringify(payload))
}

export function verifyAdminToken(token: string) {
  try {
    const decoded = JSON.parse(atob(token))

    // Check if token is expired
    if (decoded.exp < Date.now()) {
      return null
    }

    return decoded
  } catch (error) {
    return null
  }
}

export function getAdminSession(request: Request) {
  const cookies = request.headers.get("cookie")
  if (!cookies) return null

  const adminSession = cookies
    .split(";")
    .find((cookie) => cookie.trim().startsWith("admin_session="))
    ?.split("=")[1]

  if (!adminSession) return null

  return verifyAdminToken(adminSession)
}
