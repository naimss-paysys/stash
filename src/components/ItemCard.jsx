import { useState } from 'react'
import { Link, Mail, Terminal, FileText, Check, Trash2, RotateCcw, Bell, Copy, CheckCheck, Pencil, ExternalLink } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

const TYPE_CONFIG = {
  link: {
    icon: Link,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    accentBorder: 'border-l-blue-500',
    tagDot: 'bg-blue-500/60',
    label: 'Link',
  },
  email: {
    icon: Mail,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    accentBorder: 'border-l-emerald-500',
    tagDot: 'bg-emerald-500/60',
    label: 'Email',
  },
  command: {
    icon: Terminal,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    accentBorder: 'border-l-amber-500',
    tagDot: 'bg-amber-500/60',
    label: 'Command',
  },
  note: {
    icon: FileText,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    accentBorder: 'border-l-violet-500',
    tagDot: 'bg-violet-500/60',
    label: 'Note',
  },
}

function isUrl(str) {
  try { new URL(str); return true } catch { return false }
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e) => {
    e.stopPropagation()
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy'}
      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-all"
    >
      {copied
        ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

export default function ItemCard({ item, onMarkDone, onRestore, onDelete, onEdit, showRestore }) {
  const [expanded, setExpanded] = useState(false)
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.note
  const Icon = config.icon

  const hasReminder = item.reminder_at && !item.reminder_sent
  const reminderPast = item.reminder_at && new Date(item.reminder_at) < new Date()
  const isLink = item.type === 'link' && item.content && isUrl(item.content)
  const isCommand = item.type === 'command'
  const contentToCopy = item.content || item.title

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return
    if (item.content && item.content.length > 80) setExpanded(p => !p)
  }

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-gray-900 border border-gray-800 border-l-2 ${config.accentBorder} rounded-xl overflow-hidden transition-all duration-200 hover:border-gray-700 hover:shadow-lg hover:shadow-black/30 ${item.content && item.content.length > 80 ? 'cursor-pointer' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${config.iconBg}`}>
            <Icon className={`w-4 h-4 ${config.iconColor}`} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Title + actions row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {isLink ? (
                  <a
                    href={item.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="group/link inline-flex items-center gap-1 font-semibold text-gray-100 hover:text-indigo-400 transition-colors line-clamp-1"
                  >
                    <span className="line-clamp-1">{item.title}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <p className="font-semibold text-gray-100 line-clamp-1">{item.title}</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-0.5 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
                <CopyButton text={contentToCopy} />
                {onEdit && (
                  <button
                    onClick={e => { e.stopPropagation(); onEdit(item) }}
                    title="Edit"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {showRestore ? (
                  <>
                    <button
                      onClick={e => { e.stopPropagation(); onRestore(item.id) }}
                      title="Restore"
                      className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-900/30 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(item.id) }}
                      title="Delete permanently"
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-900/30 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={e => { e.stopPropagation(); onMarkDone(item.id) }}
                      title="Mark as done"
                      className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-900/30 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(item.id) }}
                      title="Delete"
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-500 hover:bg-red-900/30 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content preview */}
            {item.content && (
              isCommand ? (
                <code className="block mt-1.5 font-mono text-xs text-amber-300/80 bg-gray-800/80 rounded-lg px-2.5 py-1.5 break-all leading-relaxed">
                  {item.content}
                </code>
              ) : (
                <p className={`text-gray-400 text-sm mt-1 break-words leading-relaxed transition-all ${expanded ? '' : 'line-clamp-2'}`}>
                  {item.content}
                </p>
              )
            )}

            {/* Footer */}
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <span className="text-xs text-gray-600">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </span>

              {item.tags && item.tags.length > 0 && item.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded-md">
                  <span className={`w-1 h-1 rounded-full flex-shrink-0 ${config.tagDot}`} />
                  {tag}
                </span>
              ))}

              {hasReminder && (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                  reminderPast
                    ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}>
                  <Bell className="w-3 h-3" />
                  {format(new Date(item.reminder_at), 'MMM d, h:mm a')}
                </span>
              )}

              {item.reminder_sent && item.reminder_at && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-600 border border-gray-700/50">
                  <Bell className="w-3 h-3" />
                  Reminded
                </span>
              )}

              {item.content && item.content.length > 80 && !isCommand && (
                <span className="text-xs text-gray-600 ml-auto">
                  {expanded ? 'Show less' : 'Show more'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
