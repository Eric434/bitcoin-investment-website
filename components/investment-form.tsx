"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { TrendingUp, Shield, Info } from "lucide-react"

interface InvestmentFormProps {
  plans: any[]
  availableBalance: number
}

export default function InvestmentForm({ plans, availableBalance }: InvestmentFormProps) {
  const [selectedPlanId, setSelectedPlanId] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const router = useRouter()

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId)
  const investmentAmount = Number.parseFloat(amount) || 0
  const expectedProfit = selectedPlan
    ? ((investmentAmount * selectedPlan.apy_rate) / 100) * (selectedPlan.duration_days / 365)
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!selectedPlan) {
      setError("Please select an investment plan")
      setIsLoading(false)
      return
    }

    if (investmentAmount < selectedPlan.min_amount) {
      setError(`Minimum investment amount is $${selectedPlan.min_amount}`)
      setIsLoading(false)
      return
    }

    if (selectedPlan.max_amount && investmentAmount > selectedPlan.max_amount) {
      setError(`Maximum investment amount is $${selectedPlan.max_amount}`)
      setIsLoading(false)
      return
    }

    if (investmentAmount > availableBalance) {
      setError("Insufficient balance")
      setIsLoading(false)
      return
    }

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      // Calculate end date
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + selectedPlan.duration_days)

      // Create investment
      const { data: investmentData, error: investmentError } = await supabase
        .from("investments")
        .insert({
          user_id: user.id,
          plan_id: selectedPlan.id,
          amount: investmentAmount,
          end_date: endDate.toISOString(),
          status: "active",
        })
        .select()
        .single()

      if (investmentError) throw investmentError

      // Create transaction record
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "investment",
        amount: investmentAmount,
        description: `Investment in ${selectedPlan.name}`,
        reference_id: investmentData.id,
        status: "completed",
      })

      if (transactionError) throw transactionError

      // Redirect to success page with investment ID
      router.push(`/dashboard/invest/success?investment_id=${investmentData.id}`)
    } catch (error: any) {
      setError(error.message || "An error occurred while processing your investment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="plan">Investment Plan</Label>
        <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
          <SelectContent>
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name} - {plan.apy_rate}% APY
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Investment Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          max={availableBalance}
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        {selectedPlan && (
          <p className="text-xs text-slate-600">
            Min: ${selectedPlan.min_amount} {selectedPlan.max_amount && `• Max: $${selectedPlan.max_amount}`}
          </p>
        )}
      </div>

      {selectedPlan && investmentAmount > 0 && (
        <div className="bg-emerald-50 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
            <TrendingUp className="w-4 h-4" />
            Investment Summary
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Investment Amount:</span>
              <span className="font-medium">${investmentAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Duration:</span>
              <span className="font-medium">{selectedPlan.duration_days} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">APY Rate:</span>
              <span className="font-medium">{selectedPlan.apy_rate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Daily Return:</span>
              <span className="font-medium">${(expectedProfit / selectedPlan.duration_days).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-1">
              <span className="text-emerald-700 font-medium">Expected Profit:</span>
              <span className="text-emerald-700 font-bold">${expectedProfit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-700 font-medium">Total Return:</span>
              <span className="text-emerald-700 font-bold">${(investmentAmount + expectedProfit).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg space-y-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Investment Disclaimer</p>
            <p>
              Bitcoin investments carry inherent risks. Past performance does not guarantee future results. Only invest
              what you can afford to lose.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={setAgreedToTerms} />
          <Label htmlFor="terms" className="text-sm text-blue-700">
            I understand the risks and agree to the terms and conditions
          </Label>
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-2">
        <Shield className="w-4 h-4 text-slate-600" />
        <p className="text-xs text-slate-600">
          Your investment is secured by our platform's advanced security measures and regulatory compliance.
        </p>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={
          isLoading || !selectedPlan || investmentAmount <= 0 || investmentAmount > availableBalance || !agreedToTerms
        }
      >
        {isLoading ? "Processing Investment..." : `Invest $${investmentAmount.toFixed(2)}`}
      </Button>

      <div className="text-center">
        <p className="text-xs text-slate-500">Available Balance: ${availableBalance.toFixed(2)}</p>
      </div>
    </form>
  )
}
