import { Bookmark, Archive, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Navbar({ session, onNavigate, currentPage }) {
  const email = session?.user?.email || ''
  const displayName = email.split('@')[0]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Bookmark className="w-5 h-5" fill="currentColor" />
          <span className="text-lg font-bold text-gray-100">Stash</span>
        </button>

        <div className="flex items-center gap-1">
          <span className="text-gray-500 text-sm mr-2 hidden sm:block truncate max-w-[140px]">
            {displayName}
          </span>
          <button
            onClick={() => onNavigate(currentPage === 'archive' ? 'home' : 'archive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              currentPage === 'archive'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span className="hidden sm:block">Archive</span>
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
