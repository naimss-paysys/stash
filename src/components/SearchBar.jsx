import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search your stash..."
        className="w-full bg-gray-800/80 border border-gray-700/60 rounded-xl pl-9 pr-8 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/40 transition-all text-sm"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
