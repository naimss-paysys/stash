import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useItems(userId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const subscriptionRef = useRef(null)
  const lastFetchParamsRef = useRef(null)

  const fetchItems = useCallback(async ({ type, search, showDone = false } = {}) => {
    if (!userId) return
    setLoading(true)
    lastFetchParamsRef.current = { type, search, showDone }

    try {
      let query = supabase
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .eq('is_done', showDone)
        .order('created_at', { ascending: false })

      if (type && type !== 'all' && type !== 'reminders') {
        query = query.eq('type', type)
      }

      if (type === 'reminders') {
        query = supabase
          .from('items')
          .select('*')
          .eq('user_id', userId)
          .eq('is_done', showDone)
          .not('reminder_at', 'is', null)
          .order('reminder_at', { ascending: true })
      }

      if (search && search.trim()) {
        query = query.or(
          `title.ilike.%${search.trim()}%,content.ilike.%${search.trim()}%`
        )
      }

      const { data, error } = await query
      if (error) throw error
      setItems(data || [])
    } catch (err) {
      console.error('fetchItems error:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
    }

    subscriptionRef.current = supabase
      .channel(`items:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items', filter: `user_id=eq.${userId}` },
        () => {
          if (lastFetchParamsRef.current !== null) {
            fetchItems(lastFetchParamsRef.current)
          }
        }
      )
      .subscribe()

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [userId, fetchItems])

  const addItem = useCallback(async (data) => {
    if (!userId) return { error: new Error('Not authenticated') }

    const newItem = {
      user_id: userId,
      type: data.type,
      title: data.title,
      content: data.content || '',
      tags: data.tags || [],
      reminder_at: data.reminder_at || null,
      reminder_sent: false,
      is_done: false,
    }

    const optimisticItem = {
      ...newItem,
      id: `optimistic-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setItems(prev => [optimisticItem, ...prev])

    const { data: inserted, error } = await supabase
      .from('items')
      .insert(newItem)
      .select()
      .single()

    if (error) {
      setItems(prev => prev.filter(i => i.id !== optimisticItem.id))
      return { error }
    }

    setItems(prev => prev.map(i => i.id === optimisticItem.id ? inserted : i))
    return { data: inserted }
  }, [userId])

  const markDone = useCallback(async (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
    const { error } = await supabase
      .from('items')
      .update({ is_done: true })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('markDone error:', error)
      if (lastFetchParamsRef.current !== null) {
        fetchItems(lastFetchParamsRef.current)
      }
    }
  }, [userId, fetchItems])

  const restoreItem = useCallback(async (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
    const { error } = await supabase
      .from('items')
      .update({ is_done: false })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('restoreItem error:', error)
      if (lastFetchParamsRef.current !== null) {
        fetchItems(lastFetchParamsRef.current)
      }
    }
  }, [userId, fetchItems])

  const deleteItem = useCallback(async (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('deleteItem error:', error)
      if (lastFetchParamsRef.current !== null) {
        fetchItems(lastFetchParamsRef.current)
      }
    }
  }, [userId, fetchItems])

  const updateItem = useCallback(async (id, data) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...data } : i))
    const { error } = await supabase
      .from('items')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('updateItem error:', error)
      if (lastFetchParamsRef.current !== null) {
        fetchItems(lastFetchParamsRef.current)
      }
    }
  }, [userId, fetchItems])

  return { items, loading, addItem, markDone, restoreItem, deleteItem, fetchItems, updateItem }
}
