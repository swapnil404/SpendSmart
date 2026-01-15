import { createFileRoute } from '@tanstack/react-router'
import { OTPForm } from "@/components/otp-form"

import { z } from 'zod'

const searchSchema = z.object({
  email: z.string().email(),
  type: z.enum(["email-verification", "sign-in"]).optional().default("email-verification"),
})

export const Route = createFileRoute('/otp')({
  validateSearch: (search) => searchSchema.parse(search),
  component: OTPPage,
})

export default function OTPPage() {
  const { email, type } = Route.useSearch()
  
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xs">
        <OTPForm email={email} type={type} />
      </div>
    </div>
  )
}
