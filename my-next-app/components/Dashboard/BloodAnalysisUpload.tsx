'use client'
import React from 'react'
import { Upload } from 'lucide-react'

interface BloodAnalysisUploadProps {
  onFileChange: (file: File) => void
}

export default function BloodAnalysisUpload({ onFileChange }: BloodAnalysisUploadProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Blood Smear Image Analysis</h3>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">Upload blood smear image for AI analysis</p>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="blood-upload"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFileChange(file)
          }}
        />
        <label
          htmlFor="blood-upload"
          className="bg-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-600"
        >
          Choose Image
        </label>
      </div>
    </div>
  )
}
