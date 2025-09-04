import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-800">Account Created Successfully!</CardTitle>
            <CardDescription className="text-slate-600">Please check your email to verify your account</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-slate-600">
              We've sent a verification link to your email address. Please click the link to activate your account and
              start investing.
            </p>
            <Link
              href="/auth/login"
              className="inline-block text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
              Return to Sign In
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
