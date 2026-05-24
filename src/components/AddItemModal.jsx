import { useState, useEffect } from 'react'
import { X, Link, Mail, Terminal, FileText, Lock, Shield, ExternalLink } from 'lucide-react'

const TYPES = [
  { id: 'link', label: 'Link', icon: Link, color: 'text-blue-400' },
  { id: 'email', label: 'Email', icon: Mail, color: 'text-green-400' },
  { id: 'command', label: 'Command', icon: Terminal, color: 'text-orange-400' },
  { id: 'note', label: 'Note', icon: FileText, color: 'text-purple-400' },
  { id: 'password', label: 'Password', icon: Lock, color: 'text-gray-400' },
]

const CONTENT_PLACEHOLDERS = {
  link: 'Paste the URL...',
  email: 'Email address or contact info...',
  command: 'Enter the command...',
  note: 'Write your note...',
}

const REMINDER_PRESETS = [
  { label: '1h', offset: () => { const d = new Date(); d.setHours(d.getHours() + 1); return d } },
  { label: '4h', offset: () => { const d = new Date(); d.setHours(d.getHours() + 4); return d } },
  { label: 'Tomorrow', offset: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d } },
  { label: '3 days', offset: () => { const d = new Date(); d.setDate(d.getDate() + 3); d.setHours(9, 0, 0, 0); return d } },
  { label: '1 week', offset: () => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(9, 0, 0, 0); return d } },
]

function toLocalDatetimeValue(date) {
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function inferFromShareData(shareData) {
  if (!shareData) return { type: 'link', title: '', content: '' }
  const raw = shareData.url || shareData.text || ''
  const isUrl = /^https?:\/\//i.test(raw)
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim())

  let type = 'note'
  if (isUrl) type = 'link'
  else if (isEmail) type = 'email'

  let title = shareData.title || ''
  if (!title && isUrl) {
    try { title = new URL(raw).hostname.replace(/^www\./, '') } catch (_) {}
  }
  if (!title && raw.trim()) {
    title = raw.trim().slice(0, 60)
  }

  return { type, title, content: raw }
}

function BitwardenNote({ onSwitchToNote }) {
  return (
    <div className="text-center py-6">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-green-900/30 rounded-2xl mb-4">
        <Shield className="w-7 h-7 text-green-400" />
      </div>
      <h3 className="text-gray-100 font-semibold text-lg mb-2">For passwords, use Bitwarden</h3>
      <p className="text-gray-400 text-sm mb-1">It's free, open-source, and works everywhere.</p>
      <p className="text-gray-400 text-sm mb-6">Your passwords deserve proper encryption.</p>
      <div className="flex flex-col gap-3">
        <a
          href="https://bitwarden.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white rounded-lg px-4 py-2.5 transition-colors font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Open Bitwarden
        </a>
        <button
          onClick={onSwitchToNote}
          className="text-gray-400 hover:text-gray-200 text-sm transition-colors"
        >
          Use it for notes instead
        </button>
      </div>
    </div>
  )
}

export default function AddItemModal({ onClose, onAdd, editItem, shareData }) {
  const inferred = inferFromShareData(shareData)

  const [type, setType] = useState(editItem?.type || inferred.type)
  const [title, setTitle] = useState(editItem?.title || inferred.title)
  const [content, setContent] = useState(editItem?.content || inferred.content)
  const [tagsInput, setTagsInput] = useState(editItem?.tags?.join(', ') || '')
  const [reminderEnabled, setReminderEnabled] = useState(!!editItem?.reminder_at)
  const [reminderAt, setReminderAt] = useState(
    editItem?.reminder_at
      ? new Date(editItem.reminder_at).toISOString().slice(0, 16)
      : ''
  )
  const [useCustomReminder, setUseCustomReminder] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const validate = () => {
    const errs = {}
    if (reminderEnabled && !reminderAt) errs.reminderAt = 'Please pick a time'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (type === 'password') return

    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const trimmedContent = content.trim()
    let finalTitle = title.trim()
    if (!finalTitle && trimmedContent) {
      finalTitle = trimmedContent.slice(0, 60)
    }
    if (!finalTitle) {
      setErrors({ title: 'Title is required' })
      return
    }

    setLoading(true)
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    const payload = {
      type,
      title: finalTitle,
      content: trimmedContent,
      tags,
      reminder_at: reminderEnabled && reminderAt ? new Date(reminderAt).toISOString() : null,
    }

    const { error } = await onAdd(payload)
    setLoading(false)

    if (!error) {
      onClose()
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const applyPreset = (preset) => {
    setReminderAt(toLocalDatetimeValue(preset.offset()))
    setUseCustomReminder(false)
    setErrors(p => ({ ...p, reminderAt: '' }))
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-100">Capture Something</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {TYPES.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => { setType(t.id); setErrors({}) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  type === t.id
                    ? 'border-indigo-500 bg-indigo-900/30 text-gray-100 ring-1 ring-indigo-500'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-600'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${type === t.id ? t.color : ''}`} />
                {t.label}
              </button>
            )
          })}
        </div>

        {errors.type && <p className="text-red-400 text-xs mb-3">{errors.type}</p>}

        {type === 'password' ? (
          <BitwardenNote onSwitchToNote={() => setType('note')} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Title <span className="text-gray-600 text-xs">(optional if content is set)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })) }}
                placeholder="Something memorable..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                {type === 'link' ? 'URL' : type === 'email' ? 'Contact info' : type === 'command' ? 'Command' : 'Note'}
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={CONTENT_PLACEHOLDERS[type]}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="work, personal, urgent..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="border border-gray-800 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 flex items-center gap-2">
                  Set a Reminder
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setReminderEnabled(p => !p)
                    setReminderAt('')
                    setUseCustomReminder(false)
                  }}
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    reminderEnabled ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      reminderEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {reminderEnabled && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {REMINDER_PRESETS.map(preset => {
                      const presetVal = toLocalDatetimeValue(preset.offset())
                      const isActive = reminderAt === presetVal
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => applyPreset(preset)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium border transition-all ${
                            isActive
                              ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                              : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-600'
                          }`}
                        >
                          {preset.label}
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => setUseCustomReminder(p => !p)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium border transition-all ${
                        useCustomReminder
                          ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                          : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-600'
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {useCustomReminder && (
                    <input
                      type="datetime-local"
                      value={reminderAt}
                      onChange={e => { setReminderAt(e.target.value); setErrors(p => ({ ...p, reminderAt: '' })) }}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}

                  {reminderAt && !useCustomReminder && (
                    <p className="text-xs text-gray-500">
                      Reminder set for {new Date(reminderAt).toLocaleString()}
                    </p>
                  )}

                  {errors.reminderAt && <p className="text-red-400 text-xs">{errors.reminderAt}</p>}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-2.5 transition-colors"
            >
              {loading ? 'Saving...' : editItem ? 'Update' : 'Save to Stash'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
