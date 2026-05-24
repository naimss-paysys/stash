import { useState, useEffect, useMemo } from 'react'
import Navbar from '../components/Navbar'
import SearchBar from '../components/SearchBar'
import ItemCard from '../components/ItemCard'
import AddItemModal from '../components/AddItemModal'
import EmptyState from '../components/EmptyState'
import { useItems } from '../hooks/useItems'

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

export default function Archive({ session, onNavigate }) {
  const [search, setSearch] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const userId = session?.user?.id
  const { items, loading, restoreItem, deleteItem, fetchItems, updateItem } = useItems(userId)

  useEffect(() => {
    fetchItems({ showDone: true })
  }, [fetchItems])

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const q = search.trim().toLowerCase()
    return items.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        (item.content && item.content.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(q)))
    )
  }, [items, search])

  const handleEdit = (item) => {
    setEditItem(item)
    setShowEditModal(true)
  }

  const handleUpdate = async (data) => {
    if (!editItem) return { error: new Error('No item') }
    return await updateItem(editItem.id, data)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar session={session} onNavigate={onNavigate} currentPage="archive" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-100">Archive</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {items.length > 0
              ? `${items.length} completed item${items.length !== 1 ? 's' : ''}`
              : 'Items you mark as done appear here.'}
          </p>
        </div>

        <div className="mb-5">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {loading && items.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState isArchive />
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onRestore={restoreItem}
                onDelete={deleteItem}
                onEdit={handleEdit}
                showRestore
              />
            ))}
          </div>
        )}
      </main>

      {showEditModal && editItem && (
        <AddItemModal
          onClose={() => { setShowEditModal(false); setEditItem(null) }}
          onAdd={handleUpdate}
          editItem={editItem}
        />
      )}
    </div>
  )
}
