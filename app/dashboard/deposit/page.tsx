"use client"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, QrCode, Bitcoin, Wallet } from "lucide-react"
import Link from "next/link"

export default async function CryptoDepositPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile and portfolio
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  const { data: portfolio } = await supabase.from("portfolios").select("*").eq("user_id", user.id).single()

  // Crypto wallet addresses (in production, these would be unique per user)
  const cryptoWallets = [
    {
      name: "Bitcoin (BTC)",
      symbol: "BTC",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      network: "Bitcoin Network",
      icon: Bitcoin,
      color: "text-orange-600",
    },
    {
      name: "Ethereum (ETH)",
      symbol: "ETH",
      address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
      network: "Ethereum Network",
      icon: Wallet,
      color: "text-blue-600",
    },
    {
      name: "Tether (USDT)",
      symbol: "USDT",
      address: "TQn9Y2khEsLJW1ChVWFMSMeRDow5oREqjK",
      network: "Tron Network (TRC20)",
      icon: Wallet,
      color: "text-green-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Cryptocurrency Deposit</h1>
                <p className="text-slate-600">Fund your account with digital currencies</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Balance */}
        <Card className="bg-white shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">${portfolio?.balance?.toFixed(2) || "0.00"}</div>
            <p className="text-slate-600 mt-1">Available for investment</p>
          </CardContent>
        </Card>

        {/* Deposit Instructions */}
        <Card className="bg-white shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">How to Deposit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-slate-800">Choose Your Cryptocurrency</p>
                  <p className="text-slate-600 text-sm">Select from Bitcoin, Ethereum, or USDT below</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-slate-800">Send to Wallet Address</p>
                  <p className="text-slate-600 text-sm">
                    Copy the wallet address and send your crypto from your wallet
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-slate-800">Automatic Credit</p>
                  <p className="text-slate-600 text-sm">
                    Your balance will be updated within 10-30 minutes after confirmation
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crypto Wallets */}
        <div className="space-y-6">
          {cryptoWallets.map((wallet) => {
            const IconComponent = wallet.icon
            return (
              <Card key={wallet.symbol} className="bg-white shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-8 h-8 ${wallet.color}`} />
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-800">{wallet.name}</CardTitle>
                      <CardDescription>{wallet.network}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      {wallet.symbol}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Wallet Address</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-3 bg-slate-50 border rounded-lg font-mono text-sm break-all">
                          {wallet.address}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(wallet.address)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => navigator.clipboard.writeText(wallet.address)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Address
                      </Button>
                      <Button variant="outline">
                        <QrCode className="w-4 h-4 mr-2" />
                        QR Code
                      </Button>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Important:</strong> Only send {wallet.symbol} to this address on the {wallet.network}.
                        Sending other cryptocurrencies or using wrong networks may result in permanent loss.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Support */}
        <Card className="bg-white shadow-lg border-0 mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              If your deposit doesn't appear within 1 hour, or if you have any questions, please contact our support
              team.
            </p>
            <Button variant="outline">Contact Support</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
