import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import InvestmentForm from "@/components/investment-form"

export default async function InvestPage() {
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

  // Get available investment plans
  const { data: plans } = await supabase
    .from("investment_plans")
    .select("*")
    .eq("is_active", true)
    .order("min_amount", { ascending: true })

  const availableBalance = portfolio?.balance || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-emerald-800">Choose Investment Plan</h1>
              <p className="text-slate-600">Available Balance: ${availableBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Investment Plans */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {plans?.map((plan: any) => (
                <Card key={plan.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl font-bold text-emerald-800">{plan.name}</CardTitle>
                    <CardDescription className="text-slate-600">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600">{plan.apy_rate}%</div>
                      <p className="text-sm text-slate-600">Annual Return</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Minimum</span>
                        <span className="font-medium">${plan.min_amount}</span>
                      </div>
                      {plan.max_amount && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Maximum</span>
                          <span className="font-medium">${plan.max_amount}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Duration</span>
                        <span className="font-medium">{plan.duration_days} days</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-600 mb-3">
                        <Clock className="w-4 h-4" />
                        <span>Expected profit in {plan.duration_days} days</span>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          ${(((plan.min_amount * plan.apy_rate) / 100) * (plan.duration_days / 365)).toFixed(2)}
                        </div>
                        <p className="text-xs text-slate-500">On minimum investment</p>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={availableBalance < plan.min_amount}
                    >
                      {availableBalance < plan.min_amount ? "Insufficient Balance" : "Select Plan"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Investment Form */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-lg border-0 sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Make Investment</CardTitle>
                <CardDescription>Enter your investment details</CardDescription>
              </CardHeader>
              <CardContent>
                <InvestmentForm plans={plans || []} availableBalance={availableBalance} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
