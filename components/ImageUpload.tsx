import { useState } from 'react'
import { uploadImage } from '@/lib/supabase'
import { ImSpinner8 } from "react-icons/im"
import { toast } from "sonner"

interface ImageUploadProps {
  onUploadComplete: (url: string) => void
  className?: string
}

export default function ImageUpload({ onUploadComplete, className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      const { publicUrl } = await uploadImage(file)
      onUploadComplete(publicUrl)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className={`
          flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md
          cursor-pointer hover:bg-gray-50 transition-colors
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isUploading ? (
          <ImSpinner8 className="animate-spin text-xl" />
        ) : (
          <span>Upload Image</span>
        )}
      </label>
    </div>
  )
} 