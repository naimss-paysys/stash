import { Bookmark, Archive, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Navbar({ session, onNavigate, currentPage, itemCount }) {
  const email = session?.user?.email || ''
  const displayName = email.split('@')[0]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="bg-gray-950/90 backdrop-blur-md border-b border-gray-800/60 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 group"
        >
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
            <Bookmark className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <span className="text-base font-bold text-gray-100">Stash</span>
          {itemCount > 0 && (
            <span className="text-xs text-gray-600 font-normal hidden sm:block">
              {itemCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-1">
          <span className="text-gray-600 text-xs mr-1 hidden sm:block truncate max-w-[120px]">
            {displayName}
          </span>
          <button
            onClick={() => onNavigate(currentPage === 'archive' ? 'home' : 'archive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentPage === 'archive'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/80'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span className="hidden sm:block">Archive</span>
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-200 hover:bg-gray-800/80 transition-all"
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
