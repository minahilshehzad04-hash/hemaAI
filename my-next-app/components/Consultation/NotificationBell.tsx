'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, MessageCircle, CheckCircle, X, Clock, AlertCircle, Info, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Notification } from '@/types/consultation'

const supabase = createClient()

interface NotificationBellProps {
  userId: string | null
  userType?: 'patient' | 'doctor'
  initialUnreadCount?: number
}

export default function NotificationBell({ 
  userId, 
  userType = 'patient', 
  initialUnreadCount = 0 
}: NotificationBellProps) {
  // ✅ SAME STATE AS BEFORE
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ✅ PERFORMANCE IMPROVEMENT: Use refs to prevent re-renders
  const subscriptionRef = useRef<any>(null)
  const isMountedRef = useRef(true)
  const lastFetchTimeRef = useRef(0)

  // ✅ 1. OPTIMIZED FETCH NOTIFICATIONS (SAME FUNCTIONALITY, BETTER PERFORMANCE)
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      console.log('❌ No user ID for fetching notifications')
      return
    }

    // ✅ Debounce: Don't fetch if last fetch was < 2 seconds ago
    const now = Date.now()
    if (now - lastFetchTimeRef.current < 2000 && notifications.length > 0) {
      console.log('⏱️ Skipping fetch - too recent')
      return
    }

    try {
      setLoading(true)
      console.log('🔄 Fetching notifications for user:', userId)
      
      // ✅ OPTIMIZATION: Fetch only needed columns, limit to 15 instead of 20
      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, title, message, read, created_at, related_entity_type') // Only needed fields
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(15) // Reduced from 20 to 15

      if (error) {
        console.error('Error fetching notifications:', error)
        throw error
      }

      console.log('✅ Notifications fetched:', data?.length)
      
      if (isMountedRef.current) {
        setNotifications(data || [])
        setUnreadCount(data?.filter(n => !n.read).length || 0)
        lastFetchTimeRef.current = Date.now()
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      if (isMountedRef.current && showDropdown) {
        toast.error('Failed to load notifications')
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [userId, notifications.length, showDropdown])

  // ✅ 2. MARK AS READ (SAME)
  const markAsRead = async (notificationId: string) => {
    try {
      console.log('📖 Marking notification as read:', notificationId)
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      console.log('✅ Notification marked as read')
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark as read')
    }
  }

  // ✅ 3. MARK ALL AS READ (SAME)
  const markAllAsRead = async () => {
    if (!userId) return

    try {
      console.log('📖 Marking all notifications as read')
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) throw error

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      )
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  // ✅ 4. DELETE NOTIFICATION (SAME)
  const deleteNotification = async (notificationId: string) => {
    try {
      console.log('🗑️ Deleting notification:', notificationId)
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId)
        return notification && !notification.read ? Math.max(0, prev - 1) : prev
      })
      
      console.log('✅ Notification deleted')
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  // ✅ 5. GET NOTIFICATION ICON (SAME)
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <X className="w-4 h-4 text-red-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  // ✅ 6. GET NOTIFICATION BACKGROUND COLOR (SAME)
  const getNotificationBg = (type: string, read: boolean) => {
    if (read) return 'bg-white'
    
    switch (type) {
      case 'message':
        return 'bg-blue-50 border-l-4 border-l-blue-500'
      case 'success':
        return 'bg-green-50 border-l-4 border-l-green-500'
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-l-yellow-500'
      case 'error':
        return 'bg-red-50 border-l-4 border-l-red-500'
      default:
        return 'bg-gray-50 border-l-4 border-l-gray-500'
    }
  }

  // ✅ 7. FORMAT TIME (SAME)
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // ✅ 8. HANDLE NOTIFICATION CLICK (SAME)
  const handleNotificationClick = async (notification: Notification) => {
    console.log('👆 Notification clicked:', notification.id)
    
    if (!notification.read) {
      await markAsRead(notification.id)
    }

    if (notification.related_entity_type === 'message') {
      toast.success('Opening chat...', {
        icon: '💬',
        duration: 2000
      })
    }

    setShowDropdown(false)
  }

  // ✅ 9. OPTIMIZED REAL-TIME SUBSCRIPTION FOR NOTIFICATIONS (MAJOR PERFORMANCE IMPROVEMENT)
  useEffect(() => {
    if (!userId) {
      console.log('❌ No user ID for real-time notifications')
      return
    }

    isMountedRef.current = true
    console.log('🔄 Setting up real-time notifications for user:', userId)
    
    // Initial fetch with debounce
    const timeoutId = setTimeout(() => {
      fetchNotifications()
    }, 500)

    // ✅ OPTIMIZATION: Single subscription with proper cleanup
    subscriptionRef.current = supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as Notification
          console.log('📨 New notification received:', newNotification)
          
          // Optimistic update
          if (isMountedRef.current) {
            setNotifications(prev => [newNotification, ...prev.slice(0, 14)]) // Keep only 15
            
            if (!newNotification.read) {
              setUnreadCount(prev => prev + 1)
              
              // Show toast notification for new messages
              if (newNotification.related_entity_type === 'message') {
                toast.success(`New message: ${newNotification.message}`, {
                  icon: '💬',
                  duration: 4000
                })
              }
            }
          }
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification
          console.log('📝 Notification updated:', updatedNotification)
          
          if (isMountedRef.current) {
            setNotifications(prev =>
              prev.map(n =>
                n.id === updatedNotification.id ? updatedNotification : n
              )
            )
            
            // Only recalculate if needed
            if (updatedNotification.read) {
              setUnreadCount(prev => Math.max(0, prev - 1))
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Notification subscription status:', status)
      })

    return () => {
      console.log('🧹 Cleaning up notification subscription')
      isMountedRef.current = false
      clearTimeout(timeoutId)
      
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [userId, fetchNotifications])

  // ✅ 10. REQUEST BROWSER NOTIFICATION PERMISSION (SAME)
  useEffect(() => {
    if ('Notification' in window && window.Notification.permission === 'default') {
      window.Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('✅ Browser notification permission granted')
        } else {
          console.log('❌ Browser notification permission denied')
        }
      })
    }
  }, [])

  // ✅ 11. CLICK OUTSIDE TO CLOSE DROPDOWN (SAME)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ✅ 12. RENDER FUNCTION (SAME UI, OPTIMIZED PERFORMANCE)
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Enhanced Notification Bell - SAME STYLING */}
      <button
        onClick={() => {
          console.log('🔔 Notification bell clicked')
          setShowDropdown(!showDropdown)
          if (!showDropdown) {
            fetchNotifications() // Refresh when opened
          }
        }}
        className="relative p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-200 group"
      >
        <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <>
            {/* Pulse Animation */}
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center font-bold shadow-lg">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </span>
          </>
        )}
      </button>

      {/* Enhanced Dropdown - SAME UI */}
      {showDropdown && (
        <div className="absolute right-0 top-14 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium">
                  {unreadCount} unread
                </span>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="font-medium text-gray-600">No notifications yet</p>
                <p className="text-sm mt-2">We'll notify you when something arrives</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-all duration-200 hover:bg-gray-50 cursor-pointer group ${getNotificationBg(notification.type, notification.read)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`p-2 rounded-lg ${
                          notification.type === 'message' ? 'bg-blue-100' :
                          notification.type === 'success' ? 'bg-green-100' :
                          notification.type === 'warning' ? 'bg-yellow-100' :
                          notification.type === 'error' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className={`font-semibold text-sm flex items-center gap-2 ${
                            !notification.read ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            )}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(notification.created_at)}</span>
                          </div>
                          
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                            >
                              <Eye className="w-3 h-3" />
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDropdown(false)}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-800 font-medium py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}