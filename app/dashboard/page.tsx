import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Wallet, DollarSign, Clock, Plus, CheckCircle, Bitcoin } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user portfolio
  const { data: portfolio } = await supabase.from("portfolios").select("*").eq("user_id", user.id).single()

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get active investments with plan details
  const { data: investments } = await supabase
    .from("investments")
    .select(`
      *,
      investment_plans (
        name,
        apy_rate,
        duration_days
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  // Get recent transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const totalBalance = portfolio?.balance || 0
  const totalInvested = portfolio?.total_invested || 0
  const totalProfit = portfolio?.total_profit || 0
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-emerald-800">Portfolio Dashboard</h1>
              <p className="text-slate-600">Welcome back, {profile?.full_name || user.email}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/deposit">
                <Button
                  variant="outline"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent"
                >
                  <Bitcoin className="w-4 h-4 mr-2" />
                  Crypto Deposit
                </Button>
              </Link>
              <Link href="/dashboard/invest">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Investment
                </Button>
              </Link>
              <form action="/auth/signout" method="post">
                <Button variant="outline" type="submit">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("success") === "investment" && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <p className="text-emerald-800 font-medium">Investment created successfully!</p>
          </div>
          <p className="text-emerald-700 text-sm mt-1">Your investment is now active and earning returns.</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-800">${totalBalance.toFixed(2)}</div>
              <p className="text-xs text-slate-500 mt-1">Available for investment</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">${totalInvested.toFixed(2)}</div>
              <p className="text-xs text-slate-500 mt-1">Active investments</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">${totalProfit.toFixed(2)}</div>
              <p className="text-xs text-green-600 mt-1">+{profitPercentage.toFixed(2)}% return</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Plans</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">{investments?.length || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Running investments</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Investments */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Active Investments</CardTitle>
              <CardDescription>Your current investment portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              {investments && investments.length > 0 ? (
                <div className="space-y-4">
                  {investments.map((investment: any) => {
                    const daysLeft = Math.max(
                      0,
                      Math.ceil(
                        (new Date(investment.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                      ),
                    )
                    const progress = investment.investment_plans
                      ? Math.max(0, 100 - (daysLeft / investment.investment_plans.duration_days) * 100)
                      : 0

                    return (
                      <div key={investment.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-slate-800">{investment.investment_plans?.name}</h4>
                            <p className="text-sm text-slate-600">${investment.amount.toFixed(2)} invested</p>
                          </div>
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                            {investment.investment_plans?.apy_rate}% APY
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Progress</span>
                            <span className="text-slate-800">{daysLeft} days left</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Profit Earned</span>
                            <span className="text-green-600 font-medium">${investment.profit_earned.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No active investments yet</p>
                  <Link href="/dashboard/invest">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">Start Investing</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Recent Transactions</CardTitle>
              <CardDescription>Your latest account activity</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction: any) => (
                    <div
                      key={transaction.id}
                      className="flex justify-between items-center p-3 border border-slate-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-slate-800 capitalize">{transaction.type.replace("_", " ")}</p>
                        <p className="text-sm text-slate-600">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                        {transaction.description && <p className="text-xs text-slate-500">{transaction.description}</p>}
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            transaction.type === "deposit" ||
                            transaction.type === "profit" ||
                            transaction.type === "admin_credit"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "deposit" ||
                          transaction.type === "profit" ||
                          transaction.type === "admin_credit"
                            ? "+"
                            : "-"}
                          ${Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <Badge
                          variant={transaction.status === "completed" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
