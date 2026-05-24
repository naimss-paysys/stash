const FILTERS = [
  { id: 'all', label: 'All', emoji: null },
  { id: 'link', label: 'Links', emoji: '🔗' },
  { id: 'email', label: 'Emails', emoji: '📧' },
  { id: 'command', label: 'Commands', emoji: '⌨️' },
  { id: 'note', label: 'Notes', emoji: '📝' },
  { id: 'reminders', label: 'Reminders', emoji: '🔔' },
]

export default function FilterBar({ activeFilter, onChange, reminderCount = 0 }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {FILTERS.map(filter => {
        const isActive = activeFilter === filter.id
        const count = filter.id === 'reminders' && reminderCount > 0 ? reminderCount : null
        return (
          <button
            key={filter.id}
            onClick={() => onChange(filter.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-100 hover:bg-gray-700'
            }`}
          >
            {filter.emoji && <span>{filter.emoji}</span>}
            {filter.label}
            {count !== null && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${isActive ? 'bg-indigo-500 text-white' : 'bg-yellow-400/20 text-yellow-400'}`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
