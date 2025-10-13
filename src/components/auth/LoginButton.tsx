'use client'

import { useState } from 'react'
import { supabase } from "@/lib/supabase/client"
import { IconBrandGoogleFilled } from '@tabler/icons-react'

export const LoginButton = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) {
        console.error('Google login error:', error.message)
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Login failed:', err)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden bg-gradient-to-r from-orange-400/75 to-orange-500 hover:from-orange-600 hover:to-orange-700 text-white py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold inline-flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px]"
    >
      {/* Animated Background */}
      <div className={`absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 transition-transform duration-300 ${isHovered ? 'translate-x-0' : 'translate-x-full'}`}></div>
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      
      {/* Button Content */}
      <div className="relative z-10 flex items-center gap-3">
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <div className="relative">
              <IconBrandGoogleFilled className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'scale-110 rotate-12' : ''}`} />
              {isHovered && (
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
              )}
            </div>
            <span className="relative">
              Continue with Google
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-white/50 transform origin-left transition-transform duration-300 ${isHovered ? 'scale-x-100' : 'scale-x-0'}`}></div>
            </span>
          </>
        )}
      </div>
    </button>
  )
}