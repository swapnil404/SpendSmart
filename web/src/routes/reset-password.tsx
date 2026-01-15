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
import { ShieldCheck, Eye, EyeOff } from "lucide-react"

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
  const [showPassword, setShowPassword] = useState(false)

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
          toast.error(ctx.error.message || "Something went wrong")
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
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950">
            <Card className="w-full max-w-sm bg-black/40 border-white/10 backdrop-blur-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-destructive">Invalid Link</CardTitle>
                    <CardDescription className="text-slate-400">
                        The password reset link is invalid or expired.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full bg-slate-800 hover:bg-slate-700">
                        <a href="/">Back to login</a>
                    </Button>
                </CardContent>
            </Card>
        </div>
      )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700" />

      <Card className="w-full max-w-md bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <CardHeader className="space-y-2 pb-8 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-primary/20 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Secure Reset
          </CardTitle>
          <CardDescription className="text-slate-400">
            Create a strong new password for your account.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password text-slate-300">New Password</Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="bg-white/5 border-white/10 text-white focus:ring-primary/50 focus:border-primary/50 h-12 pr-12 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" text-slate-300>Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  className="bg-white/5 border-white/10 text-white focus:ring-primary/50 focus:border-primary/50 h-12 transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all" 
              disabled={loading}
            >
              {loading ? (
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                 </div>
              ) : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

