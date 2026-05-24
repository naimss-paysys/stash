import { useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useReminders(userId) {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'denied'
    if (Notification.permission === 'granted') return 'granted'
    if (Notification.permission === 'denied') return 'denied'
    const permission = await Notification.requestPermission()
    return permission
  }, [])

  const checkReminders = useCallback(async () => {
    if (!userId) return
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('items')
      .select('id, title, content')
      .eq('user_id', userId)
      .eq('reminder_sent', false)
      .eq('is_done', false)
      .lte('reminder_at', now)
      .not('reminder_at', 'is', null)

    if (error) {
      console.error('checkReminders error:', error)
      return
    }

    if (!data || data.length === 0) return

    for (const item of data) {
      try {
        new Notification(item.title, {
          body: item.content || 'You stashed this item.',
          icon: '/icon-192.svg',
        })
      } catch (err) {
        console.error('Notification error:', err)
      }

      await supabase
        .from('items')
        .update({ reminder_sent: true })
        .eq('id', item.id)
        .eq('user_id', userId)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return

    checkReminders()

    const interval = setInterval(checkReminders, 60000)
    return () => clearInterval(interval)
  }, [userId, checkReminders])

  return { requestPermission }
}
