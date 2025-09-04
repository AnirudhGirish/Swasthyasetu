import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import React from 'react'

const LogoutButton = () => {
    const router = useRouter();
    const handleLogout = async () =>{
        await supabase.auth.signOut();
        router.replace("/");
    }
  return (
    <div>
        <button onClick={handleLogout} className='text-sm text-red-600 border border-red-500 px-3 py-1 rounded hover:bg-red-300'>
            Logout
        </button>
    </div>
  )
}

export default LogoutButton