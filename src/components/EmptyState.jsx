import { Link, Mail, Terminal, FileText, Bell, Inbox, Plus } from 'lucide-react'

const CONFIG = {
  all: {
    icon: Inbox,
    color: 'text-gray-500',
    title: 'Nothing in your stash',
    message: 'Start capturing links, notes, commands, and more.',
  },
  link: {
    icon: Link,
    color: 'text-blue-400',
    title: 'No links saved yet',
    message: 'Save URLs, articles, and websites here.',
  },
  email: {
    icon: Mail,
    color: 'text-green-400',
    title: 'No contacts saved yet',
    message: 'Save email addresses and contact info here.',
  },
  command: {
    icon: Terminal,
    color: 'text-orange-400',
    title: 'No commands saved yet',
    message: 'Store CLI snippets and shell commands here.',
  },
  note: {
    icon: FileText,
    color: 'text-purple-400',
    title: 'No notes saved yet',
    message: 'Jot down ideas, instructions, or anything else.',
  },
  reminders: {
    icon: Bell,
    color: 'text-yellow-400',
    title: 'No reminders set',
    message: 'Add reminders to any item to get notified.',
  },
}

export default function EmptyState({ filter, onAdd, isArchive }) {
  if (isArchive) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
          <Inbox className="w-7 h-7 text-gray-500" />
        </div>
        <p className="text-gray-300 font-medium">Your archive is empty</p>
        <p className="text-gray-500 text-sm mt-1">Items you mark as done will appear here.</p>
      </div>
    )
  }

  const cfg = CONFIG[filter] || CONFIG.all
  const Icon = cfg.icon

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className={`w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center mb-4`}>
        <Icon className={`w-7 h-7 ${cfg.color}`} />
      </div>
      <p className="text-gray-300 font-medium">{cfg.title}</p>
      <p className="text-gray-500 text-sm mt-1 mb-5">{cfg.message}</p>
      {onAdd && filter !== 'reminders' && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add your first item
        </button>
      )}
    </div>
  )
}
