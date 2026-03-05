// lib/supabase/storage.ts
'use client'

import { createSupabaseClient } from "@/lib/supabase/client";
const supabase = createSupabaseClient();


export const getPublicUrl = (filePath: string | null): string | null => {
  if (!filePath) return null
  
  console.log('🖼️ Processing file path:', filePath)
  
  // If it's already a full URL, return it
  if (filePath.startsWith('http')) {
    console.log('✅ Already a full URL:', filePath)
    return filePath
  }
  
  // If it's a UUID-like filename (like the ones in your errors)
  if (filePath.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(jpg|jpeg|png)$/i)) {
    console.log('📁 UUID filename detected, trying avatars bucket:', filePath)
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
    console.log('🔄 Generated URL:', data.publicUrl)
    return data.publicUrl
  }
  
  // If it's a storage path with folder
  if (filePath.startsWith('avatars/') || filePath.includes('/')) {
    console.log('📁 Storage path detected:', filePath)
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
    console.log('🔄 Generated URL:', data.publicUrl)
    return data.publicUrl
  }
  
  console.log('❓ Unknown file path format:', filePath)
  return null
}

// Test function to check if image exists
export const checkImageExists = async (url: string | null): Promise<boolean> => {
  if (!url) return false
  
  try {
    const response = await fetch(url, { method: 'HEAD' })
    console.log('🔍 Image check:', url, response.status)
    return response.status === 200
  } catch (error) {
    console.log('❌ Image check failed:', url, error)
    return false
  }
}

// Get optimized avatar URL with fallback
export const getOptimizedAvatar = async (filePath: string | null, doctorName: string): Promise<{ url: string | null, exists: boolean }> => {
  const url = getPublicUrl(filePath)
  
  if (!url) {
    return { url: null, exists: false }
  }
  
  const exists = await checkImageExists(url)
  
  if (!exists) {
    console.log('⚠️ Image does not exist, using fallback for:', doctorName)
    return { url: null, exists: false }
  }
  
  return { url, exists: true }
}