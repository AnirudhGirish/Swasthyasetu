// src/components/Auth/LoginButton.tsx
'use client'

import { supabase } from "@/lib/supabase/client"

export const LoginButton = () => {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) console.error('Google login error:', error.message)
  }

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
    >
      Continue with Google
    </button>
  )
}
