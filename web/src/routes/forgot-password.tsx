import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"
import { Key } from "lucide-react"

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await (authClient as any).requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      }, {
        onSuccess: () => {
          setSubmitted(true)
          toast.success("Reset link sent!")
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000" />

      <Card className="w-full max-w-md bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <CardHeader className="space-y-2 pb-8 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-primary/20">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            {submitted ? "Check your email" : "Forgot Password?"}
          </CardTitle>
          <CardDescription className="text-slate-400 text-balance">
            {submitted 
              ? `We've sent a password reset link to ${email}. Please check your inbox.`
              : "Enter your email address and we'll send you a link to reset your password."}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 ml-1">Email address</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:ring-primary/50 focus:border-primary/50 h-12 transition-all duration-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute inset-0 rounded-md bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] disabled:opacity-50" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending link...
                  </div>
                ) : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
               <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-primary/80 text-sm text-center leading-relaxed italic">
                Didn't receive the email? Check your spam folder or try again in a few minutes.
              </div>
              <Button 
                variant="outline" 
                className="w-full h-12 border-white/10 hover:bg-white/5 text-slate-300"
                onClick={() => setSubmitted(false)}
              >
                Try a different email
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center pt-2 pb-8">
          <Link to="/" className="text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-2 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

