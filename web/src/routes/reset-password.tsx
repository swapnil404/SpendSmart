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
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

const searchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search) => searchSchema.parse(search),
  component: ResetPasswordPage,
})

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { token } = Route.useSearch()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (!token) {
        toast.error("Invalid token")
        return
    }

    setLoading(true)
    try {
      await (authClient as any).resetPassword({
        newPassword: password,
        token,
      }, {
        onSuccess: () => {
          toast.success("Password reset successfully")
          navigate({ to: "/" })
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

  if (!token) {
      return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-destructive">Invalid Link</CardTitle>
                    <CardDescription>
                        The password reset link is invalid or expired.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
      )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
