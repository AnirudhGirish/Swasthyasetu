import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const LogoutButton = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      router.replace("/")
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button 
      onClick={handleLogout} 
      disabled={isLoading}
      className='group relative px-4 py-2 text-sm font-semibold text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
          <span>Signing out...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </>
      )}
    </button>
  )
}

export default LogoutButton