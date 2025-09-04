import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Bitcoin, CheckCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function AdminCryptoDepositsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile?.is_admin) {
    redirect("/dashboard")
  }

  // Get all crypto deposits with user details
  const { data: deposits } = await supabase
    .from("crypto_deposits")
    .select(`
      *,
      profiles!crypto_deposits_user_id_fkey (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "confirmed":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Crypto Deposits</h1>
                <p className="text-slate-600">Monitor cryptocurrency deposits</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800">All Crypto Deposits</CardTitle>
                <CardDescription>View and manage cryptocurrency deposits</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input placeholder="Search deposits..." className="pl-10 w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {deposits && deposits.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Cryptocurrency</TableHead>
                      <TableHead>Amount (Crypto)</TableHead>
                      <TableHead>Amount (USD)</TableHead>
                      <TableHead>Network</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Confirmations</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deposits.map((deposit: any) => (
                      <TableRow key={deposit.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{deposit.profiles?.full_name || "Unknown"}</p>
                            <p className="text-sm text-slate-500">{deposit.profiles?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Bitcoin className="w-4 h-4 text-orange-600" />
                            <span className="font-medium">{deposit.cryptocurrency}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {deposit.amount_crypto} {deposit.cryptocurrency}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">${deposit.amount_usd.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">Rate: ${deposit.exchange_rate}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{deposit.network}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(deposit.status)}
                            <Badge variant="secondary" className={getStatusColor(deposit.status)}>
                              {deposit.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {deposit.confirmations}/{deposit.required_confirmations}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{new Date(deposit.created_at).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-500">{new Date(deposit.created_at).toLocaleTimeString()}</p>
                        </TableCell>
                        <TableCell>
                          {deposit.status === "confirmed" && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Complete
                            </Button>
                          )}
                          {deposit.status === "pending" && (
                            <Button size="sm" variant="outline">
                              Verify
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Bitcoin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">No crypto deposits found</p>
                <p className="text-slate-500">Cryptocurrency deposits will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
