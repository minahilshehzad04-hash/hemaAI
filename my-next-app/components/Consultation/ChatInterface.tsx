// components/ChatInterface.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Send, Check, CheckCheck, Shield, 
  Video, MoreVertical, 
  ArrowLeft, BadgeCheck,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Message, Consultation, MessageRead } from '@/types/consultation'

const supabase = createClient()

interface ChatInterfaceProps {
  consultation: Consultation
  currentUserId: string | null
  onClose: () => void
  userType: 'doctor' | 'patient'
}

export default function ChatInterface({ consultation, currentUserId, onClose, userType }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [showOptions, setShowOptions] = useState(false)
  const [messageReads, setMessageReads] = useState<MessageRead[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const canSendMessage = consultation.can_message
  const otherUser = userType === 'doctor' ? consultation.patient : consultation.doctor

  // Mark message as read using message_reads table
  const markMessageAsRead = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('message_reads')
        .insert([{
          message_id: messageId,
          reader_id: currentUserId
        }])
        .select()
        .single()

      if (error) throw error

      setMessageReads(prev => [...prev, data])
      
      // Also mark notification as read
      const { error: notificationError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('related_entity_id', messageId)
        .eq('user_id', currentUserId)
        .eq('related_entity_type', 'message')

      if (notificationError) {
        console.error('Error marking notification as read:', notificationError)
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  // Check if message is read by current user
  const isMessageRead = (messageId: string) => {
    return messageReads.some(read => read.message_id === messageId && read.reader_id === currentUserId)
  }

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch messages and read receipts
  useEffect(() => {
    if (!consultation?.id) return

    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!sender_id(full_name, profile_picture_url)
          `)
          .eq('consultation_id', consultation.id)
          .order('created_at', { ascending: true })

        if (messagesError) throw messagesError

        // Fetch read receipts
        const { data: readsData, error: readsError } = await supabase
          .from('message_reads')
          .select('*')
          .in('message_id', messagesData?.map(m => m.id) || [])

        if (readsError) throw readsError

        setMessages(messagesData || [])
        setMessageReads(readsData || [])

        // Mark all unread messages as read when chat is opened
        if (messagesData) {
          const unreadMessages = messagesData.filter(
            msg => msg.receiver_id === currentUserId && !isMessageRead(msg.id)
          )
          
          unreadMessages.forEach(msg => {
            markMessageAsRead(msg.id)
          })
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load messages')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Real-time subscription for new messages
    const messagesSubscription = supabase
      .channel(`messages-${consultation.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `consultation_id=eq.${consultation.id}`
        }, 
        async (payload) => {
          const newMessage = payload.new as Message
          
          // Don't add if it's our own message (already added optimistically)
          if (newMessage.sender_id === currentUserId) {
            return
          }
          
          // Fetch sender details for new message
          const { data: senderData } = await supabase
            .from('profiles')
            .select('full_name, profile_picture_url')
            .eq('id', newMessage.sender_id)
            .single()

          setMessages(prev => {
            // Check if message already exists
            const exists = prev.some(msg => msg.id === newMessage.id)
            if (exists) return prev
            
            return [...prev, {
              ...newMessage,
              sender: senderData
            }]
          })
          
          // If this message is for current user, mark it as read immediately
          if (newMessage.receiver_id === currentUserId) {
            markMessageAsRead(newMessage.id)
          }
        }
      )
      .subscribe()

    // Real-time subscription for read receipts
    const readsSubscription = supabase
      .channel(`message-reads-${consultation.id}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reads'
        },
        (payload) => {
          const newRead = payload.new as MessageRead
          setMessageReads(prev => [...prev, newRead])
        }
      )
      .subscribe()

    return () => {
      messagesSubscription.unsubscribe()
      readsSubscription.unsubscribe()
    }
  }, [consultation.id, currentUserId])

  const sendMessage = async () => {
    if (!newMessage.trim() || !canSendMessage) return

    setSending(true)
    const messageContent = newMessage.trim()
    const receiverId = consultation.patient_id === currentUserId 
      ? consultation.doctor_id 
      : consultation.patient_id

    // Optimistically add message to UI immediately
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      consultation_id: consultation.id,
      sender_id: currentUserId!,
      receiver_id: receiverId,
      content: messageContent,
      message_type: 'text',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      read: false,
      sender: {
        full_name: (userType === 'doctor' ? consultation.doctor?.full_name : consultation.patient?.full_name) ?? 'User',
        profile_picture_url: userType === 'doctor' ? consultation.doctor?.profile_picture_url : consultation.patient?.profile_picture_url
      }
    }

    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          consultation_id: consultation.id,
          sender_id: currentUserId,
          receiver_id: receiverId,
          content: messageContent,
          message_type: 'text'
        }])
        .select(`
          *,
          sender:profiles!sender_id(full_name, profile_picture_url)
        `)
        .single()

      if (error) throw error

      // Replace temp message with real message from database
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? data : msg
      ))

    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      // Restore message in input
      setNewMessage(messageContent)
    } finally {
      setSending(false)
    }
  }

  const blockChat = async () => {
    try {
      const { error } = await supabase
        .from('consultations')
        .update({ 
          can_message: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', consultation.id)

      if (error) throw error

      toast.success('Chat blocked successfully')
      setShowOptions(false)
    } catch (error) {
      console.error('Error blocking chat:', error)
      toast.error('Failed to block chat')
    }
  }

  const unblockChat = async () => {
    try {
      const { error } = await supabase
        .from('consultations')
        .update({ 
          can_message: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', consultation.id)

      if (error) throw error

      toast.success('Chat unblocked successfully')
      setShowOptions(false)
    } catch (error) {
      console.error('Error unblocking chat:', error)
      toast.error('Failed to unblock chat')
    }
  }

  const startVideoCall = () => {
    toast.success('Starting video call...')
    // Add video call logic here
  }

  const getOtherUserName = () => {
    if (userType === 'doctor') {
      return consultation.patient?.full_name || 'Patient'
    } else {
      return `Dr. ${consultation.doctor?.full_name || 'Doctor'}`
    }
  }

  const getAvatarUrl = (filePath: string | null) => {
    if (!filePath) return ''
    if (filePath.startsWith('http')) return filePath
    if (filePath.startsWith('avatars/') || filePath.includes('.jpg') || filePath.includes('.png')) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      return data.publicUrl
    }
    return filePath
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  }

  const getStatusColor = () => {
    return isOnline ? 'bg-green-400' : 'bg-gray-400'
  }

  const getSpecialization = () => {
    return consultation.doctor?.specialization || 'Medical Professional'
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col shadow-xl overflow-hidden">
        
        {/* Professional Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="relative">
                {otherUser?.profile_picture_url ? (
                  <img
                    src={getAvatarUrl(otherUser.profile_picture_url)}
                    alt={getOtherUserName()}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(getOtherUserName())}
                  </div>
                )}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor()}`}></div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h2 className="text-base font-semibold text-gray-900">{getOtherUserName()}</h2>
                  {consultation.doctor?.verified && (
                    <BadgeCheck className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className={`${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                    {isOnline ? 'Active now' : 'Offline'}
                  </span>
                  {userType === 'patient' && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span>{getSpecialization()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              
              {userType === 'doctor' && (
                <div className="relative">
                  <button 
                    onClick={() => setShowOptions(!showOptions)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {showOptions && (
                    <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-10">
                      {canSendMessage ? (
                        <button
                          onClick={blockChat}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <Shield className="w-4 h-4" />
                          Block Chat
                        </button>
                      ) : (
                        <button
                          onClick={unblockChat}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors text-left"
                        >
                          <Shield className="w-4 h-4" />
                          Unblock Chat
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-gray-500 text-sm">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <div className="text-2xl">💬</div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No messages yet</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Start a conversation with {getOtherUserName()}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => {
                const isOwnMessage = message.sender_id === currentUserId
                const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id
                const isRead = isMessageRead(message.id)

                return (
                  <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[75%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                      
                      {/* Avatar */}
                      {!isOwnMessage && showAvatar && (
                        <div className="flex-shrink-0">
                          {message.sender?.profile_picture_url ? (
                            <img
                              src={getAvatarUrl(message.sender.profile_picture_url)}
                              alt={message.sender.full_name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                              {getInitials(message.sender?.full_name || 'U')}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-3 py-2 rounded-2xl ${
                            isOwnMessage
                              ? 'bg-blue-500 text-white rounded-br-sm'
                              : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        </div>

                        {/* Message Time and Status */}
                        <div className={`flex items-center gap-1 mt-0.5 px-1 ${
                          isOwnMessage ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          <span className="text-[11px]">{formatTime(message.created_at)}</span>
                          {isOwnMessage && (
                            isRead ? 
                              <CheckCheck className="w-3 h-3 text-blue-500" /> : 
                              <Check className="w-3 h-3" />
                          )}
                        </div>
                      </div>

                      {/* Spacer for own messages */}
                      {isOwnMessage && showAvatar && (
                        <div className="w-7 flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Professional Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          {!canSendMessage ? (
            <div className="text-center py-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-center gap-2 text-red-700 mb-1">
                <Shield className="w-4 h-4" />
                <p className="text-sm font-medium">Chat Unavailable</p>
              </div>
              <p className="text-xs text-red-600">
                {userType === 'doctor' 
                  ? 'Enable chat to continue messaging' 
                  : 'Chat has been temporarily disabled'}
              </p>
            </div>
          ) : (
            <div className="flex gap-2 items-end">
              {/* Message Input */}
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder={`Message ${getOtherUserName()}...`}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm min-h-[44px] max-h-[120px]"
                  disabled={sending}
                  rows={1}
                />
              </div>

              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${
                  sending || !newMessage.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}