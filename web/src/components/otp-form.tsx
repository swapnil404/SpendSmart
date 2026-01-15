import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

export function OTPForm({ email, type = "email-verification", ...props }: React.ComponentProps<typeof Card> & { email: string, type?: "email-verification" | "sign-in" }) {
  const navigate = useNavigate()
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (type === "sign-in") {
      await authClient.signIn.emailOtp({
        email,
        otp,
      }, {
        onSuccess: () => {
          toast.success("Logged in successfully")
            // Small delay to ensure cookies are processed by the browser
            setTimeout(() => {
              navigate({ to: "/dashboard" })
            }, 100)
        },
        onError: (ctx) => {
          toast.error(ctx.error.message)
          setLoading(false)
        }
      })
      return
    }

    await authClient.emailOtp.verifyEmail({
        email,
        otp,
    }, {
        onSuccess: () => {
             toast.success("Email verified successfully")
             navigate({ to: "/dashboard" })
        },
        onError: (ctx) => {
             toast.error(ctx.error.message)
             setLoading(false)
        }
    })
  }

  const handleResend = async () => {
    await authClient.emailOtp.sendVerificationOtp({
        email,
        type: type 
    }, {
        onSuccess: () => {
            toast.success("Verification code resent")
        },
        onError: (ctx) => {
            toast.error(ctx.error.message)
        }
    })
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>{type === "sign-in" ? "Login with OTP" : "Enter verification code"}</CardTitle>
        <CardDescription>We sent a 6-digit code to {email}.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp">Code</FieldLabel>
              <InputOTP 
                maxLength={6} 
                id="otp" 
                required
                value={otp}
                onChange={setOtp}
              >
                <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription>
                Enter the 6-digit code sent to your email.
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify"}
              </Button>
              <FieldDescription className="text-center">
                Didn&apos;t receive the code? <button type="button" onClick={handleResend} className="underline">Resend</button>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
