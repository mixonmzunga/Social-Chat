'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Image, FileText, MapPin, UserPlus, Upload,
  Video, Music, Loader2, Send
} from 'lucide-react'
import { useChatStore, Message } from '@/store/chat-store'

interface FileAttachmentMenuProps {
  open: boolean
  onClose: () => void
  onSendMessage: (message: Omit<Message, 'id' | 'status' | 'createdAt'>) => Promise<void>
}

interface PreviewFile {
  file: File
  previewUrl: string
  type: string
  size: number
}

const ATTACHMENT_OPTIONS = [
  {
    id: 'photos',
    label: 'Photos',
    icon: Image,
    accept: 'image/*',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-500/10',
    iconColor: 'text-violet-500',
  },
  {
    id: 'videos',
    label: 'Videos',
    icon: Video,
    accept: 'video/*',
    color: 'from-red-500 to-rose-600',
    bg: 'bg-red-500/10',
    iconColor: 'text-red-500',
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: Music,
    accept: 'audio/*',
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-500/10',
    iconColor: 'text-green-500',
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.csv',
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    id: 'location',
    label: 'Location',
    icon: MapPin,
    accept: '',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: UserPlus,
    accept: '',
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-500/10',
    iconColor: 'text-pink-500',
  },
]

export function FileAttachmentMenu({ open, onClose, onSendMessage }: FileAttachmentMenuProps) {
  const { currentUser, selectedConversation } = useChatStore()
  const [uploading, setUploading] = useState(false)
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([])
  const [sharingLocation, setSharingLocation] = useState(false)

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      previewFiles.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl))
    }
  }, [previewFiles])

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    const newFiles: PreviewFile[] = Array.from(files).map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
    }))
    setPreviewFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (previewUrl: string) => {
    setPreviewFiles(prev => {
      const target = prev.find(f => f.previewUrl === previewUrl)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter(f => f.previewUrl !== previewUrl)
    })
  }

  const uploadAndSendFiles = async () => {
    if (!previewFiles.length || !currentUser || !selectedConversation) return

    setUploading(true)
    try {
      for (const fileData of previewFiles) {
        // Upload to server
        let uploadedUrl = fileData.previewUrl
        try {
          const formData = new FormData()
          formData.append('file', fileData.file)
          formData.append('conversationId', selectedConversation.id)
          formData.append('senderId', currentUser.id)

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (response.ok) {
            const data = await response.json()
            uploadedUrl = data.url
          }
        } catch (err) {
          console.warn('Upload failed, using local URL:', err)
        }

        // Determine message type
        let messageType: Message['type'] = 'file'
        let content = fileData.file.name
        if (fileData.type.startsWith('image/')) {
          messageType = 'image'
          content = '📷 Image'
        } else if (fileData.type.startsWith('video/')) {
          messageType = 'video'
          content = '🎥 Video'
        } else if (fileData.type.startsWith('audio/')) {
          messageType = 'audio'
          content = '🎵 Audio'
        }

        await onSendMessage({
          conversationId: selectedConversation.id,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar || undefined,
          content,
          type: messageType,
          fileUrl: uploadedUrl,
          fileName: fileData.file.name,
          fileSize: fileData.file.size,
          fileMimeType: fileData.type,
        })
      }

      setPreviewFiles([])
      onClose()
    } catch (error) {
      console.error('Failed to upload files:', error)
    } finally {
      setUploading(false)
    }
  }

  const shareLocation = async () => {
    if (!currentUser || !selectedConversation) return
    setSharingLocation(true)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords

      // Reverse geocode
      let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        )
        const data = await res.json()
        address = data.locality
          ? `${data.locality}, ${data.countryName}`
          : data.countryName || address
      } catch { /* fallback to coords */ }

      await onSendMessage({
        conversationId: selectedConversation.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar || undefined,
        content: '📍 Location shared',
        type: 'location',
        location: { latitude, longitude, address, name: 'My Location' },
      })

      onClose()
    } catch (error) {
      console.error('Location error:', error)
      alert('Could not get your location. Please check your permissions.')
    } finally {
      setSharingLocation(false)
    }
  }

  const shareContact = async () => {
    if (!currentUser || !selectedConversation) return

    await onSendMessage({
      conversationId: selectedConversation.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar || undefined,
      content: '👤 Contact shared',
      type: 'contact',
      contact: {
        name: currentUser.name,
        phone: currentUser.phone || undefined,
        email: currentUser.email,
        avatar: currentUser.avatar || undefined,
      },
    })

    onClose()
  }

  const handleOptionClick = (optionId: string) => {
    if (optionId === 'location') {
      shareLocation()
    } else if (optionId === 'contact') {
      shareContact()
    } else {
      fileInputRefs.current[optionId]?.click()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#1e1e2e] rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
          >
            {/* Drag Handle */}
            <div className="flex items-center justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <h2 className="text-lg font-semibold text-white">Share</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Preview Panel */}
            <AnimatePresence>
              {previewFiles.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4">
                    <div className="bg-white/5 rounded-2xl p-3 space-y-2 max-h-48 overflow-y-auto">
                      {previewFiles.map((file) => (
                        <div
                          key={file.previewUrl}
                          className="flex items-center gap-3 bg-white/5 rounded-xl p-2.5"
                        >
                          {/* Thumbnail */}
                          {file.type.startsWith('image/') ? (
                            <img
                              src={file.previewUrl}
                              alt={file.file.name}
                              className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : file.type.startsWith('video/') ? (
                            <div className="w-11 h-11 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                              <Video className="w-5 h-5 text-red-400" />
                            </div>
                          ) : file.type.startsWith('audio/') ? (
                            <div className="w-11 h-11 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                              <Music className="w-5 h-5 text-green-400" />
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-blue-400" />
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {file.file.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatFileSize(file.size)}
                            </p>
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => removeFile(file.previewUrl)}
                            className="p-1.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Send Button */}
                    <button
                      onClick={uploadAndSendFiles}
                      disabled={uploading}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium transition-all disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send {previewFiles.length} file{previewFiles.length > 1 ? 's' : ''}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Attachment Grid */}
            <div className="px-5 pb-6">
              <div className="grid grid-cols-3 gap-4">
                {ATTACHMENT_OPTIONS.map((option, index) => {
                  const Icon = option.icon
                  const isLoading = option.id === 'location' && sharingLocation
                  return (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleOptionClick(option.id)}
                      disabled={isLoading}
                      className="flex flex-col items-center gap-2.5 py-3 group"
                    >
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${option.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-active:scale-95 transition-transform`}>
                        {isLoading ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <Icon className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
                        {option.label}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Hidden File Inputs */}
            {ATTACHMENT_OPTIONS.filter(o => o.accept).map(option => (
              <input
                key={option.id}
                ref={(el) => { fileInputRefs.current[option.id] = el }}
                type="file"
                accept={option.accept}
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            ))}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
