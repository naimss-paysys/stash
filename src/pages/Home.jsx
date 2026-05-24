import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import Navbar from '../components/Navbar'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import ItemCard from '../components/ItemCard'
import AddItemModal from '../components/AddItemModal'
import EmptyState from '../components/EmptyState'
import { useItems } from '../hooks/useItems'
import { useReminders } from '../hooks/useReminders'

function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 border-l-2 border-l-gray-700 rounded-xl p-4 animate-pulse">
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-gray-800 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2.5 pt-0.5">
          <div className="h-4 bg-gray-800 rounded-md w-2/3" />
          <div className="h-3 bg-gray-800 rounded-md w-full" />
          <div className="h-3 bg-gray-800 rounded-md w-1/2" />
        </div>
      </div>
    </div>
  )
}

export default function Home({ session, onNavigate, shareData }) {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(!!shareData)
  const [editItem, setEditItem] = useState(null)

  const userId = session?.user?.id
  const { items, loading, addItem, markDone, deleteItem, fetchItems, updateItem } = useItems(userId)
  const { requestPermission } = useReminders(userId)

  useEffect(() => {
    fetchItems({ showDone: false })
  }, [fetchItems])

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  const filteredItems = useMemo(() => {
    let result = items

    if (activeFilter === 'reminders') {
      result = result.filter(item => item.reminder_at)
    } else if (activeFilter !== 'all') {
      result = result.filter(item => item.type === activeFilter)
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        item =>
          item.title.toLowerCase().includes(q) ||
          (item.content && item.content.toLowerCase().includes(q)) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(q)))
      )
    }

    return result
  }, [items, activeFilter, search])

  const counts = useMemo(() => ({
    all:       items.length,
    link:      items.filter(i => i.type === 'link').length,
    email:     items.filter(i => i.type === 'email').length,
    command:   items.filter(i => i.type === 'command').length,
    note:      items.filter(i => i.type === 'note').length,
    reminders: items.filter(i => i.reminder_at && !i.reminder_sent).length,
  }), [items])

  const handleAdd = async (data) => {
    if (editItem) {
      const result = await updateItem(editItem.id, data)
      return result
    }
    return await addItem(data)
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditItem(null)
  }

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setSearch('')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar session={session} onNavigate={onNavigate} currentPage="home" itemCount={items.length} />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Search + Add */}
        <div className="mb-4 flex gap-3 items-center">
          <SearchBar value={search} onChange={setSearch} />
          <button
            onClick={() => setShowAddModal(true)}
            className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition-all shadow-lg shadow-indigo-900/30 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Filter bar */}
        <div className="mb-5">
          <FilterBar
            activeFilter={activeFilter}
            onChange={handleFilterChange}
            counts={counts}
          />
        </div>

        {/* Stats line */}
        {!search && activeFilter === 'all' && items.length > 0 && (
          <p className="text-xs text-gray-600 mb-3 px-0.5">
            {items.length} item{items.length !== 1 ? 's' : ''} stashed
            {counts.reminders > 0 && ` · ${counts.reminders} pending reminder${counts.reminders !== 1 ? 's' : ''}`}
          </p>
        )}

        {/* Content */}
        {loading && items.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState filter={activeFilter} onAdd={() => setShowAddModal(true)} />
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onMarkDone={markDone}
                onDelete={deleteItem}
                onEdit={handleEdit}
                showRestore={false}
              />
            ))}
          </div>
        )}
      </main>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-900/40 flex items-center justify-center transition-all z-30"
        aria-label="Add item"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showAddModal && (
        <AddItemModal
          onClose={handleCloseModal}
          onAdd={handleAdd}
          editItem={editItem}
          shareData={!editItem ? shareData : null}
        />
      )}
    </div>
  )
}
