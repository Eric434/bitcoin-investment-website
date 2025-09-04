import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, TrendingUp, Activity, Settings, Bitcoin } from "lucide-react"
import Link from "next/link"
import { AdminSignOutButton } from "@/components/admin-sign-out-button"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get platform statistics (using service role for admin access)
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: activeInvestments } = await supabase
    .from("investments")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  const { data: totalInvestedData } = await supabase.from("portfolios").select("total_invested")
  const totalInvested = totalInvestedData?.reduce((sum, portfolio) => sum + (portfolio.total_invested || 0), 0) || 0

  const { data: totalProfitData } = await supabase.from("portfolios").select("total_profit")
  const totalProfit = totalProfitData?.reduce((sum, portfolio) => sum + (portfolio.total_profit || 0), 0) || 0

  // Get recent users
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  // Get recent investments
  const { data: recentInvestments } = await supabase
    .from("investments")
    .select(`
      *,
      profiles!investments_user_id_fkey (
        full_name,
        email
      ),
      investment_plans (
        name,
        apy_rate
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
              <p className="text-slate-600">Platform management and analytics</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/users">
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <AdminSignOutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Platform Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{totalUsers || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Registered investors</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Investments</CardTitle>
              <Activity className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-800">{activeInvestments || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Running plans</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">${totalInvested.toFixed(2)}</div>
              <p className="text-xs text-slate-500 mt-1">Platform volume</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Profits</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">${totalProfit.toFixed(2)}</div>
              <p className="text-xs text-slate-500 mt-1">User earnings</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Recent Users</CardTitle>
              <CardDescription>Latest user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              {recentUsers && recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {recentUsers.map((user: any) => (
                    <div
                      key={user.id}
                      className="flex justify-between items-center p-3 border border-slate-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{user.full_name || "No name"}</p>
                        <p className="text-sm text-slate-600">{user.email}</p>
                        <p className="text-xs text-slate-500">{new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        {user.is_admin && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Admin
                          </Badge>
                        )}
                        <Link href={`/admin/users`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No users found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Investments */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Recent Investments</CardTitle>
              <CardDescription>Latest investment activity</CardDescription>
            </CardHeader>
            <CardContent>
              {recentInvestments && recentInvestments.length > 0 ? (
                <div className="space-y-3">
                  {recentInvestments.map((investment: any) => (
                    <div
                      key={investment.id}
                      className="flex justify-between items-center p-3 border border-slate-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{investment.profiles?.full_name || "Unknown User"}</p>
                        <p className="text-sm text-slate-600">{investment.investment_plans?.name}</p>
                        <p className="text-xs text-slate-500">{new Date(investment.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-emerald-600">${investment.amount.toFixed(2)}</p>
                        <Badge variant="secondary" className="text-xs">
                          {investment.investment_plans?.apy_rate}% APY
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No investments found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white shadow-lg border-0 mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/admin/users">
                <Button className="w-full h-20 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700">
                  <Users className="w-6 h-6" />
                  <span>Manage Users</span>
                </Button>
              </Link>
              <Link href="/admin/investments">
                <Button className="w-full h-20 flex flex-col gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Activity className="w-6 h-6" />
                  <span>View Investments</span>
                </Button>
              </Link>
              <Link href="/admin/crypto-deposits">
                <Button className="w-full h-20 flex flex-col gap-2 bg-orange-600 hover:bg-orange-700">
                  <Bitcoin className="w-6 h-6" />
                  <span>Crypto Deposits</span>
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button className="w-full h-20 flex flex-col gap-2 bg-purple-600 hover:bg-purple-700">
                  <Settings className="w-6 h-6" />
                  <span>Platform Settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
