'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Download, MapPin, User, Phone, Mail, FileText,
  Play, Pause, Volume2, Image as ImageIcon, Video, File,
  ExternalLink, Copy, Check, CheckCheck, X,
  Pencil, Trash2, Share2, CheckSquare
} from 'lucide-react'
import { Message } from '@/store/chat-store'
import { useChatStore } from '@/store/chat-store'
import { useSocket } from '@/hooks/useSocket'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  isFirst: boolean
  isLast: boolean
  formatTime: (date: Date | string) => string
}

export function MessageBubble({ message, isOwn, isFirst, isLast, formatTime }: MessageBubbleProps) {
  const { selectedConversation } = useChatStore()
  const { deleteMessageApi } = useSocket()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioProgress, setAudioProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message.content)

  const { editMessage, deleteMessage, toggleSelectMessage, selectedMessageIds } = useChatStore()
  const isSelected = selectedMessageIds.includes(message.id)

  // ─── Helpers ──────────────────────────────────────────────────────

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const getFileExtIcon = (mimeType?: string) => {
    if (!mimeType) return { icon: File, color: 'text-gray-400', bg: 'bg-gray-500/20' }
    if (mimeType.includes('pdf')) return { icon: FileText, color: 'text-red-400', bg: 'bg-red-500/20' }
    if (mimeType.includes('word') || mimeType.includes('document')) return { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/20' }
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return { icon: FileText, color: 'text-green-400', bg: 'bg-green-500/20' }
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return { icon: FileText, color: 'text-orange-400', bg: 'bg-orange-500/20' }
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return { icon: File, color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
    return { icon: File, color: 'text-gray-400', bg: 'bg-gray-500/20' }
  }

  const handleDownload = () => {
    if (message.fileUrl && message.fileName) {
      const link = document.createElement('a')
      link.href = message.fileUrl
      link.download = message.fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleCopyContact = () => {
    if (message.contact) {
      const info = [
        `Name: ${message.contact.name}`,
        message.contact.phone ? `Phone: ${message.contact.phone}` : '',
        message.contact.email ? `Email: ${message.contact.email}` : '',
      ].filter(Boolean).join('\n')
      navigator.clipboard.writeText(info)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openLocation = () => {
    if (message.location) {
      window.open(
        `https://www.google.com/maps?q=${message.location.latitude},${message.location.longitude}`,
        '_blank'
      )
    }
  }

  const toggleAudio = (audioEl: HTMLAudioElement | null) => {
    if (!audioEl) return
    if (isPlaying) {
      audioEl.pause()
    } else {
      audioEl.play()
    }
    setIsPlaying(!isPlaying)
  }

  // ─── Render Content ────────────────────────────────────────────────

  const handleCopy = () => {
    const text = message.type === 'text' ? message.content : message.fileUrl || ''
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEditSave = () => {
    if (editText.trim() && message.type === 'text') {
      editMessage(message.id, { content: editText.trim() })
      setIsEditing(false)
    }
  }

  const handleForward = () => {
    // simple forward: copy content/URL to clipboard
    handleCopy()
  }

  const handleDelete = async () => {
    // call server to remove message
    try {
      await deleteMessageApi(message.id)
    } catch (err) {
      console.error('API delete failed', err)
    }
    deleteMessage(message.id)
  }

  const renderContent = () => {
    if (isEditing && message.type === 'text') {
      return (
        <div className="flex flex-col">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full bg-transparent text-[15px] text-white placeholder:text-gray-400 focus:outline-none resize-none"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={() => { setIsEditing(false); setEditText(message.content) }}
              className="text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              className="text-xs text-blue-400 hover:text-blue-500"
            >
              Save
            </button>
          </div>
        </div>
      )
    }

    switch (message.type) {
      // ── Image ──
      case 'image':
        return (
          <div className="space-y-1.5">
            <div
              className="relative rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setLightboxOpen(true)}
            >
              {/* Shimmer placeholder */}
              {!imageLoaded && !imageError && (
                <div className="w-[240px] h-[180px] bg-white/5 animate-pulse rounded-xl" />
              )}
              {imageError ? (
                <div className="w-[240px] h-[120px] bg-white/5 rounded-xl flex items-center justify-center gap-2">
                  <ImageIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-500">Failed to load</span>
                </div>
              ) : (
                <img
                  src={message.fileUrl}
                  alt={message.fileName || 'Image'}
                  className={`max-w-[240px] w-full h-auto rounded-xl object-cover transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
            </div>
          </div>
        )

      // ── Video ──
      case 'video':
        return (
          <div className="space-y-1.5">
            <div className="relative rounded-xl overflow-hidden max-w-[260px]">
              <video
                src={message.fileUrl}
                className="w-full h-auto rounded-xl"
                controls
                preload="metadata"
              />
            </div>
            {message.fileName && (
              <p className="text-xs text-gray-400 truncate">{message.fileName}</p>
            )}
          </div>
        )

      // ── Audio ──
      case 'audio':
        return (
          <div className="min-w-[200px]">
            <div className={`flex items-center gap-3 p-3 rounded-xl ${isOwn ? 'bg-white/10' : 'bg-white/5'}`}>
              <button
                onClick={(e) => {
                  const audioEl = (e.currentTarget.parentElement?.parentElement?.querySelector('audio')) as HTMLAudioElement
                  toggleAudio(audioEl)
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isOwn
                    ? 'bg-white/20 hover:bg-white/30'
                    : 'bg-purple-500/20 hover:bg-purple-500/30'
                  } transition-colors`}
              >
                {isPlaying ? (
                  <Pause className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-purple-400'}`} />
                ) : (
                  <Play className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-purple-400'} ml-0.5`} />
                )}
              </button>

              {/* Waveform bars */}
              <div className="flex-1 flex items-center gap-[3px] h-8">
                {Array.from({ length: 20 }).map((_, i) => {
                  const height = Math.random() * 100
                  const isFilled = (i / 20) * 100 <= audioProgress
                  return (
                    <div
                      key={i}
                      className={`w-[3px] rounded-full transition-colors ${isFilled
                          ? (isOwn ? 'bg-white' : 'bg-purple-400')
                          : (isOwn ? 'bg-white/30' : 'bg-white/10')
                        }`}
                      style={{ height: `${Math.max(15, height)}%` }}
                    />
                  )
                })}
              </div>

              <span className={`text-[11px] flex-shrink-0 ${isOwn ? 'text-white/60' : 'text-gray-500'}`}>
                {audioDuration > 0 ? formatDuration(audioDuration) : '--:--'}
              </span>
            </div>

            <audio
              src={message.fileUrl}
              preload="metadata"
              className="hidden"
              onLoadedMetadata={(e) => setAudioDuration((e.target as HTMLAudioElement).duration)}
              onTimeUpdate={(e) => {
                const audio = e.target as HTMLAudioElement
                setAudioProgress((audio.currentTime / audio.duration) * 100)
              }}
              onEnded={() => {
                setIsPlaying(false)
                setAudioProgress(0)
              }}
            />
          </div>
        )

      // ── Document/File ──
      case 'file': {
        const fileInfo = getFileExtIcon(message.fileMimeType)
        const FileIcon = fileInfo.icon
        return (
          <div className="min-w-[200px]">
            <div
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${isOwn ? 'bg-white/10 hover:bg-white/15' : 'bg-white/5 hover:bg-white/10'
                } transition-colors`}
              onClick={handleDownload}
            >
              <div className={`w-11 h-11 rounded-xl ${fileInfo.bg} flex items-center justify-center flex-shrink-0`}>
                <FileIcon className={`w-5 h-5 ${fileInfo.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {message.fileName || 'File'}
                </p>
                <p className={`text-xs ${isOwn ? 'text-white/50' : 'text-gray-500'}`}>
                  {message.fileSize ? formatFileSize(message.fileSize) : 'Unknown size'}
                </p>
              </div>
              <Download className={`w-5 h-5 flex-shrink-0 ${isOwn ? 'text-white/60' : 'text-gray-400'}`} />
            </div>
          </div>
        )
      }

      // ── Location ──
      case 'location':
        return (
          <div className="min-w-[200px]">
            <div
              className={`rounded-xl overflow-hidden cursor-pointer group ${isOwn ? 'bg-white/10' : 'bg-white/5'
                }`}
              onClick={openLocation}
            >
              {/* Map preview placeholder */}
              <div className="relative h-28 bg-gradient-to-br from-green-900/40 to-emerald-900/40 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/30 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                {/* Decorative map gridlines */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-1/4 left-0 right-0 h-px bg-white" />
                  <div className="absolute top-2/4 left-0 right-0 h-px bg-white" />
                  <div className="absolute top-3/4 left-0 right-0 h-px bg-white" />
                  <div className="absolute left-1/4 top-0 bottom-0 w-px bg-white" />
                  <div className="absolute left-2/4 top-0 bottom-0 w-px bg-white" />
                  <div className="absolute left-3/4 top-0 bottom-0 w-px bg-white" />
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-white">
                  {message.location?.name || 'Location'}
                </p>
                {message.location?.address && (
                  <p className={`text-xs mt-0.5 line-clamp-2 ${isOwn ? 'text-white/50' : 'text-gray-500'}`}>
                    {message.location.address}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-2">
                  <ExternalLink className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400 font-medium group-hover:underline">
                    Open in Google Maps
                  </span>
                </div>
              </div>
            </div>
          </div>
        )

      // ── Contact ──
      case 'contact':
        return (
          <div className="min-w-[200px]">
            <div className={`rounded-xl p-3 ${isOwn ? 'bg-white/10' : 'bg-white/5'}`}>
              <div className="flex items-center gap-3">
                {message.contact?.avatar ? (
                  <img
                    src={message.contact.avatar}
                    alt={message.contact.name}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-white/10"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {message.contact?.name}
                  </p>
                  {message.contact?.phone && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span className={`text-xs ${isOwn ? 'text-white/50' : 'text-gray-400'}`}>
                        {message.contact.phone}
                      </span>
                    </div>
                  )}
                  {message.contact?.email && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className={`text-xs ${isOwn ? 'text-white/50' : 'text-gray-400'} truncate`}>
                        {message.contact.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleCopyContact}
                className={`mt-2.5 w-full py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${copied
                    ? 'bg-green-500/20 text-green-400'
                    : isOwn
                      ? 'bg-white/10 hover:bg-white/15 text-white/80'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300'
                  }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Contact Info
                  </>
                )}
              </button>
            </div>
          </div>
        )

      // ── Text (default) ──
      default:
        return (
          <p className="text-[15px] leading-[22px] break-words whitespace-pre-wrap">
            {message.content}
          </p>
        )
    }
  }

  // ─── Bubble Shape ──────────────────────────────────────────────────

  const getBorderRadius = () => {
    if (isOwn) {
      return `${isFirst ? 'rounded-tl-2xl' : 'rounded-tl-lg'} ${isLast ? 'rounded-bl-2xl' : 'rounded-bl-lg'} rounded-tr-2xl rounded-br-2xl`
    }
    return `${isFirst ? 'rounded-tr-2xl' : 'rounded-tr-lg'} ${isLast ? 'rounded-br-2xl' : 'rounded-br-lg'} rounded-tl-2xl rounded-bl-2xl`
  }

  const isMediaType = ['image', 'video'].includes(message.type)

  return (
    <>
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isFirst ? 'mt-3' : ''}`}>  
        {/* wrap with context menu for actions */}
        <ContextMenu>
          <ContextMenuTrigger>
            <div className={`max-w-[80%] sm:max-w-[70%] ${isOwn ? 'ml-12' : 'mr-12'} ${isSelected ? 'ring-2 ring-blue-400' : ''}`}>  
              {/* Sender name for groups */}
              {!isOwn && selectedConversation?.type === 'group' && isFirst && (
                <p className="text-xs text-purple-400 font-medium mb-1.5 ml-3">
                  {message.senderName}
                </p>
              )}

              {/* Bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`relative ${isMediaType ? 'p-1.5' : 'px-4 py-2.5'} ${isOwn
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                    : 'bg-[#2a2a2a] text-white'
                  } ${getBorderRadius()}`}
              >
                {renderContent()}

                {/* Time and Status */}
                <div className={`flex items-center justify-end gap-1.5 ${isMediaType ? 'px-2 pb-1' : ''} mt-1.5 ${isOwn ? 'text-white/50' : 'text-gray-500'
                  }`}>
                  <span className="text-[11px]">{formatTime(message.createdAt)}</span>
                  {isOwn && (
                    <span className="flex items-center">
                      {message.status === 'read' ? (
                        <CheckCheck className="w-4 h-4 text-blue-400" />
                      ) : message.status === 'delivered' ? (
                        <CheckCheck className="w-4 h-4" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent>
            {message.type === 'text' && (
              <ContextMenuItem onSelect={() => setIsEditing(true)}>
                <Pencil className="w-4 h-4" /> Edit
              </ContextMenuItem>
            )}
            <ContextMenuItem onSelect={handleCopy}>
              <Copy className="w-4 h-4" /> {copied ? 'Copied' : 'Copy'}
            </ContextMenuItem>
            <ContextMenuItem onSelect={handleForward}>
              <Share2 className="w-4 h-4" /> Forward
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => toggleSelectMessage(message.id)}>
              <CheckSquare className="w-4 h-4" /> {isSelected ? 'Deselect' : 'Select'}
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive" onSelect={handleDelete}>
              <Trash2 className="w-4 h-4" /> Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && message.type === 'image' && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={message.fileUrl}
            alt={message.fileName || 'Image'}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
