"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Wallet, TrendingUp, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"

interface UserManagementTableProps {
  users: any[]
}

export default function UserManagementTable({ users }: UserManagementTableProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [creditAmount, setCreditAmount] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  const handleCreditBalance = async () => {
    if (!selectedUser || !creditAmount) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()
      const amount = Number.parseFloat(creditAmount)

      if (amount <= 0) {
        throw new Error("Amount must be greater than 0")
      }

      // Create admin credit transaction
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: selectedUser.id,
        type: "admin_credit",
        amount: amount,
        description: description || `Admin credit: $${amount}`,
        status: "completed",
      })

      if (transactionError) throw transactionError

      setSuccess(`Successfully credited $${amount} to ${selectedUser.full_name || selectedUser.email}`)
      setCreditAmount("")
      setDescription("")
      setIsDialogOpen(false)

      // Refresh the page to show updated balances
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred while crediting balance")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Total Invested</TableHead>
              <TableHead>Total Profit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.full_name || "No name"}</p>
                    <p className="text-sm text-slate-500">ID: {user.id.slice(0, 8)}...</p>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">${user.portfolios?.[0]?.balance?.toFixed(2) || "0.00"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span>${user.portfolios?.[0]?.total_invested?.toFixed(2) || "0.00"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-medium">
                      ${user.portfolios?.[0]?.total_profit?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {user.is_admin && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Admin
                      </Badge>
                    )}
                    <Badge variant="outline">Active</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Dialog open={isDialogOpen && selectedUser?.id === user.id} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user)
                          setError(null)
                          setSuccess(null)
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Credit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Credit User Balance</DialogTitle>
                        <DialogDescription>
                          Add funds to {user.full_name || user.email}'s account balance
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Credit Amount ($)</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="Enter amount to credit"
                            value={creditAmount}
                            onChange={(e) => setCreditAmount(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Input
                            id="description"
                            placeholder="Reason for credit"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-sm text-slate-600">
                            Current Balance: ${user.portfolios?.[0]?.balance?.toFixed(2) || "0.00"}
                          </p>
                          {creditAmount && (
                            <p className="text-sm font-medium text-emerald-600">
                              New Balance: $
                              {((user.portfolios?.[0]?.balance || 0) + Number.parseFloat(creditAmount) || 0).toFixed(2)}
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={handleCreditBalance}
                          disabled={isLoading || !creditAmount || Number.parseFloat(creditAmount) <= 0}
                          className="w-full"
                        >
                          {isLoading ? "Processing..." : `Credit $${creditAmount || "0.00"}`}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
