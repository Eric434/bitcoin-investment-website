import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Activity } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function AdminInvestmentsPage() {
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

  // Get all investments with user and plan details
  const { data: investments } = await supabase
    .from("investments")
    .select(`
      *,
      profiles!investments_user_id_fkey (
        full_name,
        email
      ),
      investment_plans (
        name,
        apy_rate,
        duration_days
      )
    `)
    .order("created_at", { ascending: false })

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
                <h1 className="text-2xl font-bold text-slate-800">Investment Management</h1>
                <p className="text-slate-600">Monitor all platform investments</p>
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
                <CardTitle className="text-lg font-semibold text-slate-800">All Investments</CardTitle>
                <CardDescription>View and monitor user investments</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input placeholder="Search investments..." className="pl-10 w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {investments && investments.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>APY</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Profit Earned</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investments.map((investment: any) => {
                      const daysLeft = Math.max(
                        0,
                        Math.ceil(
                          (new Date(investment.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                        ),
                      )

                      return (
                        <TableRow key={investment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{investment.profiles?.full_name || "Unknown"}</p>
                              <p className="text-sm text-slate-500">{investment.profiles?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{investment.investment_plans?.name}</p>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">${investment.amount.toFixed(2)}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                              {investment.investment_plans?.apy_rate}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p>{investment.investment_plans?.duration_days} days</p>
                            {investment.status === "active" && (
                              <p className="text-xs text-slate-500">{daysLeft} days left</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-green-600">${investment.profit_earned.toFixed(2)}</p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={investment.status === "active" ? "default" : "secondary"}
                              className={
                                investment.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : investment.status === "completed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {investment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{new Date(investment.start_date).toLocaleDateString()}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{new Date(investment.end_date).toLocaleDateString()}</p>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">No investments found</p>
                <p className="text-slate-500">Investments will appear here once users start investing</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
