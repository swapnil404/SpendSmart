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

export function OTPForm({ email, ...props }: React.ComponentProps<typeof Card> & { email: string }) {
  const navigate = useNavigate()
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
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
        type: "email-verification"
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
        <CardTitle>Enter verification code</CardTitle>
        <CardDescription>We sent a 6-digit code to {email}.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp">Verification code</FieldLabel>
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
