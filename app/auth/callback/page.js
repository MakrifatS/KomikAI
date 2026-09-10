'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [msg, setMsg] = useState('Menyelesaikan proses masuk...')

  useEffect(() => {
    let cancelled = false
    async function run() {
      const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
      const sessionId = new URLSearchParams(hash).get('session_id')
      if (!sessionId) {
        setMsg('Token sesi tidak ditemukan. Mengalihkan...')
        setTimeout(() => router.replace('/'), 1200)
        return
      }
      try {
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ session_id: sessionId }),
        })
        if (!res.ok) throw new Error('failed')
        window.history.replaceState({}, document.title, '/auth/callback')
        if (!cancelled) router.replace('/')
      } catch (e) {
        setMsg('Gagal masuk. Mengalihkan...')
        setTimeout(() => router.replace('/'), 1500)
      }
    }
    run()
    return () => { cancelled = true }
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      <p className="text-sm text-zinc-400">{msg}</p>
    </div>
  )
}
