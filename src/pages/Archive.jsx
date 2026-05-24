import { useState, useEffect, useMemo } from 'react'
import Navbar from '../components/Navbar'
import SearchBar from '../components/SearchBar'
import ItemCard from '../components/ItemCard'
import EmptyState from '../components/EmptyState'
import { useItems } from '../hooks/useItems'

export default function Archive({ session, onNavigate }) {
  const [search, setSearch] = useState('')

  const userId = session?.user?.id
  const { items, loading, restoreItem, deleteItem, fetchItems } = useItems(userId)

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

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar session={session} onNavigate={onNavigate} currentPage="archive" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-100 mb-1">Archive</h1>
          <p className="text-gray-500 text-sm">Items you've marked as done.</p>
        </div>

        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} />
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
          <EmptyState isArchive={true} />
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onRestore={restoreItem}
                onDelete={deleteItem}
                showRestore={true}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
