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

export default function Home({ session, onNavigate, shareData }) {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(!!shareData)

  const userId = session?.user?.id
  const { items, loading, addItem, markDone, deleteItem, fetchItems } = useItems(userId)
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

  const reminderCount = useMemo(
    () => items.filter(i => i.reminder_at && !i.reminder_sent).length,
    [items]
  )

  const handleAdd = async (data) => {
    const result = await addItem(data)
    return result
  }

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setSearch('')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar session={session} onNavigate={onNavigate} currentPage="home" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-4 flex gap-3 items-center">
          <SearchBar value={search} onChange={setSearch} />
          <button
            onClick={() => setShowAddModal(true)}
            className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="mb-4">
          <FilterBar
            activeFilter={activeFilter}
            onChange={handleFilterChange}
            reminderCount={reminderCount}
          />
        </div>

        {loading && items.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-800 rounded w-3/4" />
                    <div className="h-3 bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            filter={activeFilter}
            onAdd={() => setShowAddModal(true)}
          />
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onMarkDone={markDone}
                onDelete={deleteItem}
                showRestore={false}
              />
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => setShowAddModal(true)}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-30"
        aria-label="Add item"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
          shareData={shareData}
        />
      )}
    </div>
  )
}
