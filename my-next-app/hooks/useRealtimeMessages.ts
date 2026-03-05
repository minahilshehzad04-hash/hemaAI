'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Message } from '@/types/consultation'

const supabase = createClient()

interface UseRealtimeMessages {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  loading: boolean
  sendMessage: (content: string) => Promise<any>
  markMessageAsRead: (messageId: string) => Promise<void>
  markAllMessagesAsRead: () => Promise<void>
  markMessageAsDeleted: (messageId: string) => void
  canSendMessages: boolean
  fetchMessages: () => Promise<void>
}

export const useRealtimeMessages = (
  consultationId: string | null, 
  currentUserId: string | null
): UseRealtimeMessages => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [canSendMessages, setCanSendMessages] = useState(false)

  // Check if messaging is allowed for this consultation
  const checkMessagingPermission = useCallback(async () => {
    if (!consultationId) {
      setCanSendMessages(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('can_message, status, patient_id, doctor_id')
        .eq('id', consultationId)
        .single()

      if (error) throw error

      setCanSendMessages(data?.can_message || false)
      
      // Update receiver_id based on current user role
      if (data && currentUserId) {
        const receiverId = currentUserId === data.patient_id ? data.doctor_id : data.patient_id
        return receiverId
      }
    } catch (error) {
      console.error('Error checking messaging permission:', error)
      setCanSendMessages(false)
    }
  }, [consultationId, currentUserId])

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!consultationId || !currentUserId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            full_name,
            profile_picture_url,
            role
          )
        `)
        .eq('consultation_id', consultationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [consultationId, currentUserId])

  // Send message with consultation validation
  const sendMessage = useCallback(async (content: string) => {
    if (!consultationId || !currentUserId || !canSendMessages) {
      toast.error('Messaging is not enabled for this consultation')
      throw new Error('Messaging disabled')
    }

    try {
      // Get consultation details to determine receiver
      const { data: consultation, error: consultError } = await supabase
        .from('consultations')
        .select('patient_id, doctor_id')
        .eq('id', consultationId)
        .single()

      if (consultError) throw consultError

      const receiverId = currentUserId === consultation.patient_id 
        ? consultation.doctor_id 
        : consultation.patient_id

      const { data, error } = await supabase
        .from('messages')
        .insert([{
          consultation_id: consultationId,
          sender_id: currentUserId,
          receiver_id: receiverId,
          content: content.trim(),
          message_type: 'text',
          read: false
        }])
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            full_name,
            profile_picture_url,
            role
          )
        `)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      throw error
    }
  }, [consultationId, currentUserId, canSendMessages])

  // Mark message as read
  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)
        .eq('receiver_id', currentUserId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }, [currentUserId])

  // Mark all messages as read
  const markAllMessagesAsRead = useCallback(async () => {
    if (!consultationId || !currentUserId) return

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('consultation_id', consultationId)
        .eq('receiver_id', currentUserId)
        .eq('read', false)

      if (error) throw error
    } catch (error) {
      console.error('Error marking all messages as read:', error)
    }
  }, [consultationId, currentUserId])

  // Mark message as deleted (local state only)
  const markMessageAsDeleted = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }, [])

  // Real-time subscription
  useEffect(() => {
    if (!consultationId) return

    const subscription = supabase
      .channel(`messages-${consultationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `consultation_id=eq.${consultationId}`
      }, (payload) => {
        const newMessage = payload.new as Message
        setMessages(prev => [...prev, newMessage])
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `consultation_id=eq.${consultationId}`
      }, (payload) => {
        const updatedMessage = payload.new as Message
        setMessages(prev => 
          prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
        )
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
        filter: `consultation_id=eq.${consultationId}`
      }, (payload) => {
        const deletedMessage = payload.old as Message
        setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id))
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [consultationId])

  // Consultation status subscription
  useEffect(() => {
    if (!consultationId) return

    const subscription = supabase
      .channel(`consultation-status-${consultationId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'consultations',
        filter: `id=eq.${consultationId}`
      }, (payload) => {
        const updatedConsultation = payload.new as any
        setCanSendMessages(updatedConsultation.can_message || false)
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [consultationId])

  // Initial data fetch
  useEffect(() => {
    fetchMessages()
    checkMessagingPermission()
  }, [fetchMessages, checkMessagingPermission])

  return {
    messages,
    setMessages,
    loading,
    sendMessage,
    markMessageAsRead,
    markAllMessagesAsRead,
    markMessageAsDeleted,
    canSendMessages,
    fetchMessages
  }
}