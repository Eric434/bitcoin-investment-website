import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, TrendingUp, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

export default async function InvestmentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ investment_id?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  let investment = null
  if (params.investment_id) {
    const { data } = await supabase
      .from("investments")
      .select(`
        *,
        investment_plans (
          name,
          apy_rate,
          duration_days
        )
      `)
      .eq("id", params.investment_id)
      .eq("user_id", user.id)
      .single()
    investment = data
  }

  const expectedProfit = investment
    ? ((investment.amount * investment.investment_plans.apy_rate) / 100) *
      (investment.investment_plans.duration_days / 365)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-800">Investment Successful!</CardTitle>
            <CardDescription className="text-slate-600">
              Your Bitcoin investment has been activated and is now earning returns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {investment && (
              <div className="bg-emerald-50 p-6 rounded-lg space-y-4">
                <h3 className="font-semibold text-emerald-800 text-lg">Investment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Plan:</span>
                      <span className="font-medium">{investment.investment_plans.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Amount Invested:</span>
                      <span className="font-bold text-emerald-700">${investment.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">APY Rate:</span>
                      <Badge className="bg-emerald-600">{investment.investment_plans.apy_rate}%</Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Duration:</span>
                      <span className="font-medium">{investment.investment_plans.duration_days} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Expected Profit:</span>
                      <span className="font-bold text-green-600">${expectedProfit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Maturity Date:</span>
                      <span className="font-medium">{new Date(investment.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Daily Returns</p>
                <p className="font-bold text-emerald-700">
                  ${investment ? (expectedProfit / investment.investment_plans.duration_days).toFixed(2) : "0.00"}
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Days Remaining</p>
                <p className="font-bold text-blue-700">
                  {investment ? investment.investment_plans.duration_days : "0"} days
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Total Return</p>
                <p className="font-bold text-green-700">
                  ${investment ? (investment.amount + expectedProfit).toFixed(2) : "0.00"}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your investment is now active and earning daily returns</li>
                <li>• Profits will be automatically calculated and added to your account</li>
                <li>• You can track your progress in the dashboard</li>
                <li>• Funds will be available for withdrawal after the investment period</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-center">
              <Link href="/dashboard">
                <Button className="bg-emerald-600 hover:bg-emerald-700">View Dashboard</Button>
              </Link>
              <Link href="/dashboard/invest">
                <Button variant="outline">Make Another Investment</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
