import { Layers, Link, Mail, Terminal, FileText, Bell } from 'lucide-react'

const FILTERS = [
  { id: 'all',       label: 'All',       icon: Layers   },
  { id: 'link',      label: 'Links',     icon: Link     },
  { id: 'email',     label: 'Emails',    icon: Mail     },
  { id: 'command',   label: 'Commands',  icon: Terminal },
  { id: 'note',      label: 'Notes',     icon: FileText },
  { id: 'reminders', label: 'Reminders', icon: Bell     },
]

export default function FilterBar({ activeFilter, onChange, counts = {} }) {
  return (
    <div
      className="flex gap-1.5 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {FILTERS.map(filter => {
        const Icon = filter.icon
        const isActive = activeFilter === filter.id
        const count = counts[filter.id]
        const showCount = count != null && count > 0

        return (
          <button
            key={filter.id}
            onClick={() => onChange(filter.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'bg-gray-800/80 text-gray-400 hover:text-gray-100 hover:bg-gray-700/80'
            }`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{filter.label}</span>
            {showCount && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold min-w-[20px] text-center ${
                isActive
                  ? 'bg-white/20 text-white'
                  : filter.id === 'reminders'
                  ? 'bg-yellow-400/20 text-yellow-400'
                  : 'bg-gray-700 text-gray-300'
              }`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
