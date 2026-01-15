import { Button } from "@/components/ui/button"
import { Link, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute('/coming-soon')({
  component: ComingSoonPage,
})

export default function ComingSoonPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Coming Soon</h1>
        <p className="text-muted-foreground text-lg">
          We are working hard to bring Google Sign-In to SpendSmart.
        </p>
        <div className="p-4 bg-muted/50 rounded-lg border">
          <p className="font-medium">Please login with your Email & Password for now.</p>
        </div>
        <Button asChild>
            <Link to="/">Back to Login</Link>
        </Button>
      </div>
    </div>
  )
}
