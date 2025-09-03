// src/app/login/page.tsx
'use client'

import { LoginButton } from "@/src/components/auth/LoginButton"


export default function LoginPage() {
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <h1 className="text-2xl font-semibold">Welcome to SwasthyaSetu</h1>
      <LoginButton/>
    </div>
  )
}
