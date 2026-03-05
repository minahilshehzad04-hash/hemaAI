'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

const supabase = createClient()

interface UseMessageNotificationsProps {
  userId: string | null
  userType: 'patient' | 'doctor'
  onNewMessage?: (message: any) => void
}

export function useMessageNotifications({ 
  userId, 
  userType, 
  onNewMessage 
}: UseMessageNotificationsProps) {
  const notifiedMessagesRef = useRef<Set<string>>(new Set())
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    // ✅ EARLY RETURN - No unnecessary setups
    if (!userId) {
      console.log('⏳ Waiting for user ID...')
      return
    }

    console.log('🔄 Setting up enhanced message notifications for user:', userId)

    // ✅ PREVENT DUPLICATE SUBSCRIPTIONS
    if (subscriptionRef.current) {
      console.log('📡 Subscription already exists, skipping...')
      return
    }

    const channel = supabase
      .channel(`enhanced-message-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        async (payload) => {
          try {
            const newMessage = payload.new as any
            console.log('📨 New message received:', newMessage)

            // Prevent duplicate notifications
            if (notifiedMessagesRef.current.has(newMessage.id)) {
              return
            }
            notifiedMessagesRef.current.add(newMessage.id)

            // Get sender information
            const { data: sender } = await supabase
              .from('profiles')
              .select('full_name, role')
              .eq('id', newMessage.sender_id)
              .single()

            const senderName = sender?.full_name || 'Someone'
            const isDoctor = sender?.role === 'doctor'
            const displayName = isDoctor ? `Dr. ${senderName}` : senderName

            // Show enhanced notification
            showEnhancedMessageNotification({
              message: newMessage.content,
              senderName: displayName,
              isDoctor,
              onOpenChat: () => {
                console.log('💬 Opening chat from notification')
                markMessageAsRead(newMessage.id)
                onNewMessage?.(newMessage)
              },
              onMarkRead: () => {
                console.log('📖 Marking message as read from notification')
                markMessageAsRead(newMessage.id)
              }
            })

          } catch (error) {
            console.error('❌ Error processing message notification:', error)
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Enhanced notification subscription status:', status)
        if (status === 'SUBSCRIBED') {
          subscriptionRef.current = channel
        }
      })

    return () => {
      console.log('🧹 Cleaning up enhanced message notifications')
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
        subscriptionRef.current = null
      }
    }
  }, [userId, userType, onNewMessage])
}

// Helper function to mark message as read
async function markMessageAsRead(messageId: string) {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId)

    if (error) throw error
    console.log('✅ Message marked as read:', messageId)
  } catch (error) {
    console.error('Error marking message as read:', error)
  }
}

// Enhanced notification display (same as before)
function showEnhancedMessageNotification({
  message,
  senderName,
  isDoctor,
  onOpenChat,
  onMarkRead
}: {
  message: string
  senderName: string
  isDoctor: boolean
  onOpenChat: () => void
  onMarkRead: () => void
}) {
  console.log('🔔 Showing enhanced notification from:', senderName)
  
  toast.custom(
    (t) => (
      <div 
        className={`max-w-md w-full bg-white shadow-2xl rounded-2xl border-l-4 ${
          isDoctor ? 'border-blue-500' : 'border-green-500'
        } transform transition-all duration-500 ${
          t.visible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-32 opacity-0 scale-95'
        }`}
      >
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                isDoctor 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-r from-green-500 to-green-600'
              }`}>
                <span className="text-white font-bold text-sm">
                  {isDoctor ? 'DR' : 'PT'}
                </span>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${
                      isDoctor ? 'bg-blue-500' : 'bg-green-500'
                    }`}></span>
                    New Message
                  </p>
                  <p className="text-xs font-semibold mt-1 text-gray-600">
                    From <span className={isDoctor ? 'text-blue-600' : 'text-green-600'}>
                      {senderName}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Message Preview */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                <p className="text-sm text-gray-700 line-clamp-2 break-words">
                  {message}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onOpenChat()
                    toast.dismiss(t.id)
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg ${
                    isDoctor
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  }`}
                >
                  💬 Open Chat
                </button>
                <button
                  onClick={() => {
                    onMarkRead()
                    toast.dismiss(t.id)
                  }}
                  className="px-4 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Read
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      duration: 8000,
      position: 'top-right',
    }
  )

  // Browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`💬 New Message from ${senderName}`, {
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      icon: '/icon.png',
      tag: 'medcare-message',
      requireInteraction: true
    })
  }
}