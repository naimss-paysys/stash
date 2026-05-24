import { useState } from 'react'
import { Link, Mail, Terminal, FileText, Check, Trash2, RotateCcw, Bell } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

const TYPE_CONFIG = {
  link: {
    icon: Link,
    color: 'text-blue-400',
    bg: 'bg-blue-900/20',
    border: 'border-blue-900/40',
  },
  email: {
    icon: Mail,
    color: 'text-green-400',
    bg: 'bg-green-900/20',
    border: 'border-green-900/40',
  },
  command: {
    icon: Terminal,
    color: 'text-orange-400',
    bg: 'bg-orange-900/20',
    border: 'border-orange-900/40',
  },
  note: {
    icon: FileText,
    color: 'text-purple-400',
    bg: 'bg-purple-900/20',
    border: 'border-purple-900/40',
  },
}

function isUrl(str) {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

export default function ItemCard({ item, onMarkDone, onRestore, onDelete, showRestore }) {
  const [hovered, setHovered] = useState(false)
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.note
  const Icon = config.icon

  const titleEl = item.type === 'link' && item.content && isUrl(item.content) ? (
    <a
      href={item.content}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-100 font-semibold hover:text-indigo-400 transition-colors line-clamp-1"
      onClick={e => e.stopPropagation()}
    >
      {item.title}
    </a>
  ) : (
    <span className="text-gray-100 font-semibold line-clamp-1">{item.title}</span>
  )

  const hasReminder = item.reminder_at && !item.reminder_sent
  const reminderPast = item.reminder_at && new Date(item.reminder_at) < new Date()

  return (
    <div
      className={`bg-gray-900 border rounded-xl p-4 transition-all ${
        hovered ? 'border-gray-600' : 'border-gray-800'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${config.bg} ${config.border} border`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {titleEl}
              {item.content && (
                <p className="text-gray-400 text-sm mt-0.5 line-clamp-2 break-all">
                  {item.content}
                </p>
              )}
            </div>

            <div className={`flex items-center gap-1.5 flex-shrink-0 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0 sm:opacity-100'}`}>
              {showRestore ? (
                <>
                  <button
                    onClick={() => onRestore(item.id)}
                    className="p-1.5 rounded-lg text-green-500 hover:bg-green-900/30 transition-colors"
                    title="Restore"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-900/30 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onMarkDone(item.id)}
                    className="p-1.5 rounded-lg text-green-500 hover:bg-green-900/30 transition-colors"
                    title="Mark as done"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className={`p-1.5 rounded-lg text-red-500 hover:bg-red-900/30 transition-all ${
                      hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 mt-2">
            {item.tags && item.tags.length > 0 && item.tags.map(tag => (
              <span key={tag} className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
            <span className="text-xs text-gray-600">
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </span>
            {hasReminder && (
              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                reminderPast ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'
              }`}>
                <Bell className="w-3 h-3" />
                {format(new Date(item.reminder_at), 'MMM d, h:mm a')}
              </span>
            )}
            {item.reminder_sent && item.reminder_at && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500">
                <Bell className="w-3 h-3" />
                Reminded
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
