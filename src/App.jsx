import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Home from './pages/Home'
import Archive from './pages/Archive'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center animate-pulse">
          <Bookmark className="w-7 h-7 text-white" fill="white" />
        </div>
        <p className="text-gray-500 text-sm">Loading Stash...</p>
      </div>
    </div>
  )
}

function parseShareParams() {
  const params = new URLSearchParams(window.location.search)
  const url = params.get('url')
  const text = params.get('text')
  const title = params.get('title')
  if (url || text) {
    window.history.replaceState({}, '', '/')
    return { url, text, title }
  }
  return null
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('home')
  const [shareData] = useState(() => parseShareParams())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) setPage('home')
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <LoadingScreen />
  if (!session) return <Auth />

  return page === 'archive'
    ? <Archive session={session} onNavigate={setPage} />
    : <Home session={session} onNavigate={setPage} shareData={shareData} />
}
