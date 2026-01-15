import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await (authClient as any).forgetPassword({
        email,
        redirectTo: "/reset-password",
      }, {
        onSuccess: () => {
          setSubmitted(true)
          toast.success("Reset link sent to your email")
        },
        onError: (ctx: any) => {
          toast.error(ctx.error.message)
          setLoading(false)
        }
      })
    } catch (error) {
      toast.error("An error occurred")
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We have sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending link..." : "Send Reset Link"}
            </Button>
            <Button variant="ghost" className="w-full" asChild>
                <Link to="/">Back to Login</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
