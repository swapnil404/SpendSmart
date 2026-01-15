
import { Link, createFileRoute } from '@tanstack/react-router';
import { useQuery } from "@tanstack/react-query";

import { LoginForm } from "@/components/login-form"

export const Route = createFileRoute('/')({
  component: LoginPage,
})

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
