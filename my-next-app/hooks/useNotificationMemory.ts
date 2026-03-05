'use client'

import { useState, useEffect, useCallback } from 'react'

export const useNotificationMemory = () => {
  const [processedMessages, setProcessedMessages] = useState<Set<string>>(new Set())
  const [isLoaded, setIsLoaded] = useState(false)

  // Load processed messages from localStorage
  useEffect(() => {
    const loadProcessedMessages = () => {
      try {
        const stored = localStorage.getItem('doctor_processed_messages')
        if (stored) {
          const parsed = JSON.parse(stored)
          console.log('📥 Loaded processed messages from storage:', parsed.length)
          
          // ✅ NEW: Filter out any messages that might be too old (optional)
          // This prevents memory from growing indefinitely
          const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          const recentMessages = parsed.filter((id: string) => {
            // If message ID contains timestamp, check if it's recent
            return true; // Keep all for now, you can add filtering logic if needed
          });
          
          setProcessedMessages(new Set(recentMessages))
        } else {
          console.log('📥 No stored processed messages found')
        }
      } catch (error) {
        console.error('Error loading processed messages:', error)
        // ✅ Clear corrupted storage
        localStorage.removeItem('doctor_processed_messages')
      } finally {
        setIsLoaded(true)
        console.log('✅ Notification memory loaded')
      }
    }
    
    loadProcessedMessages()
  }, [])

  // Save processed messages to localStorage
  const saveProcessedMessages = useCallback((messages: Set<string>) => {
    try {
      const array = [...messages]
      localStorage.setItem('doctor_processed_messages', JSON.stringify(array))
    } catch (error) {
      console.error('Error saving processed messages:', error)
    }
  }, [])

  const addProcessedMessage = useCallback((messageId: string) => {
    setProcessedMessages(prev => {
      const newSet = new Set(prev)
      newSet.add(messageId)
      saveProcessedMessages(newSet)
      console.log('✅ Added to processed messages:', messageId, 'Total:', newSet.size)
      return newSet
    })
  }, [saveProcessedMessages])

  const clearProcessedMessages = useCallback(() => {
    const previousSize = processedMessages.size
    setProcessedMessages(new Set())
    localStorage.removeItem('doctor_processed_messages')
    console.log('🧹 Cleared all processed messages. Previous count:', previousSize)
  }, [processedMessages.size])

  const isMessageProcessed = useCallback((messageId: string) => {
    return processedMessages.has(messageId)
  }, [processedMessages])

  // ✅ Batch add processed messages
  const addProcessedMessagesBatch = useCallback((messageIds: string[]) => {
    setProcessedMessages(prev => {
      const newSet = new Set(prev)
      messageIds.forEach(id => newSet.add(id))
      saveProcessedMessages(newSet)
      console.log('✅ Added batch to processed messages:', messageIds.length, 'Total:', newSet.size)
      return newSet
    })
  }, [saveProcessedMessages])

  // ✅ Check if multiple messages are processed
  const areMessagesProcessed = useCallback((messageIds: string[]) => {
    return messageIds.every(id => processedMessages.has(id))
  }, [processedMessages])

  // ✅ Remove specific messages from memory
  const removeProcessedMessages = useCallback((messageIds: string[]) => {
    setProcessedMessages(prev => {
      const newSet = new Set(prev)
      messageIds.forEach(id => newSet.delete(id))
      saveProcessedMessages(newSet)
      console.log('🗑️ Removed messages from memory:', messageIds.length, 'Remaining:', newSet.size)
      return newSet
    })
  }, [saveProcessedMessages])

  return {
    processedMessages,
    addProcessedMessage,
    addProcessedMessagesBatch,
    removeProcessedMessages,
    clearProcessedMessages,
    isMessageProcessed,
    areMessagesProcessed,
    isLoaded
  }
}