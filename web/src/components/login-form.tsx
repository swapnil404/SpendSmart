import { cn } from "@/lib/utils"
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
import { Link, useNavigate } from "@tanstack/react-router"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      console.log("Attempting login...")
      // Set a fallback timeout in case Better Auth doesn't resolve/reject
      setTimeout(() => {
        setLoading(currentLoading => {
          if (currentLoading) {
            toast.error("Login timed out. Please check your connection.")
            return false;
          }
          return currentLoading;
        })
      }, 15000)

      await authClient.signIn.email({
        email,
        password,
      }, {
        onSuccess: async () => {
          console.log("Login success: Navigating to dashboard...")
          toast.success("Logged in successfully")
          // Small delay to ensure cookies are processed by the browser
          setTimeout(() => {
            navigate({ to: "/dashboard" })
          }, 100)
        },
        onError: (ctx) => {
          console.error("Login error", ctx.error)
          toast.error(ctx.error.message)
          setLoading(false)
        }
      })
    } catch (err) {
      console.error("Login caught error", err)
      toast.error("An unexpected error occurred")
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
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
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
              <Button variant="outline" className="w-full" type="button">
                Login with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
           <Link to="/register" className="underline underline-offset-4">
  Sign up
</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
