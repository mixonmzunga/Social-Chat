'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, MoreVertical, Copy, Check, CheckCheck,
  Download, FileText, Image as ImageIcon, File, Edit2, Trash2,
  Share2, Reply, Eye, X, ZoomIn, ZoomOut, Star, Pin, Heart,
  MessageSquarePlus, MessageSquareX
} from 'lucide-react'
import { Message, useChatStore } from '@/store/chat-store'
import { useSocket } from '@/hooks/useSocket'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { EmojiReactions } from './emoji-reactions'
import { WaveformPlayer } from './waveform-player'
import { DocumentPreview } from './document-preview'

interface ModernMessageBubbleProps {
  message: Message
  isOwn: boolean
  isFirst: boolean
  isLast: boolean
  isGrouped?: boolean
}

export function ModernMessageBubble({
  message,
  isOwn,
  isFirst,
  isLast,
  isGrouped = false,
}: ModernMessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message.content)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isStarred, setIsStarred] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const { deleteMessage, editMessage, setReplyToMessage, currentUser, toggleSelectMessage, selectedMessageIds } = useChatStore()
  const { deleteMessageApi } = useSocket()

  const isSelected = selectedMessageIds.includes(message.id)

  const formatTime = (date: Date | string | null | undefined) => {
    if (!date) return ''
    const d = typeof date === 'string' ? new Date(date) : date
    return format(d, 'HH:mm')
  }

  const handleCopy = () => {
    const text = message.type === 'text' ? message.content : message.fileUrl || ''
    navigator.clipboard.writeText(text)
    setCopied(true)
    setIsMenuOpen(false)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSelect = () => {
    toggleSelectMessage(message.id)
    setIsMenuOpen(false)
  }

  const handleReply = () => {
    setReplyToMessage(message)
    setIsMenuOpen(false)
    setIsImageMenuOpen(false)
  }

  const handleStar = () => {
    setIsStarred(!isStarred)
    setIsMenuOpen(false)
    // TODO: Implement star message functionality
    console.log('Star message:', message.id, !isStarred)
  }

  const handlePin = () => {
    setIsPinned(!isPinned)
    setIsMenuOpen(false)
    // TODO: Implement pin message functionality
    console.log('Pin message:', message.id, !isPinned)
  }

  const handleEmojiReact = (emoji: string) => {
    setShowEmojiPicker(false)
    setIsMenuOpen(false)
    // TODO: Implement emoji reaction functionality
    console.log('React with emoji:', emoji, message.id)
  }

  const handleForward = () => {
    // TODO: Implement forward message functionality
    console.log('Forward message:', message.id)
    setIsMenuOpen(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setIsMenuOpen(false)
  }

  const handleSaveEdit = () => {
    if (editText.trim()) {
      editMessage(message.id, { content: editText.trim() })
    }
    setIsEditing(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMessageApi(message.id)
    } catch (err) {
      console.error('Delete failed:', err)
    }
    deleteMessage(message.id)
    setShowDeleteConfirm(false)
    setIsMenuOpen(false)
    setIsImageMenuOpen(false)
    setIsDeleting(false)
  }

  const handleDownload = () => {
    if (message.fileUrl) {
      const link = document.createElement('a')
      link.href = message.fileUrl
      link.download = message.fileName || 'image'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    setIsImageMenuOpen(false)
    setIsMenuOpen(false)
  }

  const handleViewImage = () => {
    setLightboxOpen(true)
    setIsImageMenuOpen(false)
  }

  const toggleZoom = () => {
    setZoom(prev => (prev === 1 ? 2 : 1))
  }

  const bubbleClasses = `
    relative px-3 md:px-4 py-2 md:py-3 rounded-2xl max-w-xs md:max-w-md lg:max-w-xl
    transition-all duration-200 hover:shadow-md
    ${isOwn
      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm'
      : 'bg-gray-200 text-gray-800 rounded-bl-sm'
    }
    ${isFirst ? '' : isOwn ? 'rounded-tr-lg' : 'rounded-tl-lg'}
    ${isLast ? '' : isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'}
  `

  // ─── Classic dropdown items shared between image and regular menus ───
  const ImageMenuItems = () => (
    <>
      <DropdownMenuItem onClick={handleSelect} className="flex items-center gap-2 cursor-pointer py-2.5 text-sm">
        {isSelected ? <MessageSquareX className="w-4 h-4 text-blue-500" /> : <MessageSquarePlus className="w-4 h-4 text-gray-400" />}
        <span>{isSelected ? 'Deselect' : 'Select'}</span>
      </DropdownMenuItem>

      <DropdownMenuItem onClick={handleReply} className="flex items-center gap-2 cursor-pointer py-2.5 text-sm">
        <Reply className="w-4 h-4 text-gray-400" />
        <span>Reply</span>
      </DropdownMenuItem>

      <DropdownMenuItem onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex items-center gap-2 cursor-pointer py-2.5 text-sm">
        <Heart className="w-4 h-4 text-gray-400" />
        <span>React</span>
      </DropdownMenuItem>

      <DropdownMenuItem onClick={handleStar} className="flex items-center gap-2 cursor-pointer py-2.5 text-sm">
        <Star className={`w-4 h-4 ${isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
        <span>{isStarred ? 'Unstar' : 'Star'}</span>
      </DropdownMenuItem>

      <DropdownMenuItem onClick={handlePin} className="flex items-center gap-2 cursor-pointer py-2.5 text-sm">
        <Pin className={`w-4 h-4 ${isPinned ? 'text-red-500' : 'text-gray-400'}`} />
        <span>{isPinned ? 'Unpin' : 'Pin'}</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem onClick={handleForward} className="flex items-center gap-2 cursor-pointer py-2.5 text-sm">
        <Share2 className="w-4 h-4 text-gray-400" />
        <span>Forward</span>
      </DropdownMenuItem>

      <DropdownMenuItem onClick={handleViewImage} className="flex items-center gap-2 cursor-pointer py-2.5 text-sm">
        <Eye className="w-4 h-4 text-gray-400" />
        <span>View</span>
      </DropdownMenuItem>

      <DropdownMenuItem onClick={handleDownload} className="flex items-center gap-2 cursor-pointer py-2.5 text-sm">
        <Download className="w-4 h-4 text-gray-400" />
        <span>Download</span>
      </DropdownMenuItem>

      {isOwn && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setShowDeleteConfirm(true)
              setIsImageMenuOpen(false)
            }}
            className="flex items-center gap-2 cursor-pointer py-2.5 text-sm text-red-500 focus:text-red-500 focus:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </>
      )}
    </>
  )

  const TextMenuItems = () => (
    <>
      <DropdownMenuItem onClick={handleSelect} className="flex items-center gap-2 cursor-pointer py-2.5 text-sm">
        {isSelected ? <MessageSquareX className="w-4 h-4 text-blue-500" /> : <MessageSquarePlus className="w-4 h-4 text-gray-400" />}
        <span>{isSelected ? 'Deselect' : 'Select'}</span>
      </DropdownMenuItem>

      <DropdownMenuItem onClick={handleReply} className="flex items-center gap-2 cursor-pointer py-2.5 text-sm">
        <Reply className="w-4 h-4 text-gray-400" />
        <span>Reply</span>
      </DropdownMenuItem>

      <DropdownMenuItem onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex items-center gap-2 cursor-pointer py-2.5 text-sm">
        <Heart className="w-4 h-4 text-gray-400" />
        <span>React</span>
      </DropdownMenuItem>

      <DropdownMenuItem onClick={handleStar} className="flex items-center gap-2 cursor-pointer py-2.5 text-sm">
        <Star className={`w-4 h-4 ${isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
        <span>{isStarred ? 'Unstar' : 'Star'}</span>
      </DropdownMenuItem>

      <DropdownMenuItem onClick={handlePin} className="flex items-center gap-2 cursor-pointer py-2.5 text-sm">
        <Pin className={`w-4 h-4 ${isPinned ? 'text-red-500' : 'text-gray-400'}`} />
        <span>{isPinned ? 'Unpin' : 'Pin'}</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem onClick={handleForward} className="flex items-center gap-2 cursor-pointer py-2.5 text-sm">
        <Share2 className="w-4 h-4 text-gray-400" />
        <span>Forward</span>
      </DropdownMenuItem>

      {message.type === 'text' && (
        <DropdownMenuItem onClick={handleCopy} className="flex items-center gap-2 cursor-pointer py-2.5 text-sm">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </DropdownMenuItem>
      )}

      {message.fileUrl && (
        <DropdownMenuItem onClick={handleDownload} className="flex items-center gap-2 cursor-pointer py-2.5 text-sm">
          <Download className="w-4 h-4 text-gray-400" />
          <span>Download</span>
        </DropdownMenuItem>
      )}

      {isOwn && message.type === 'text' && (
        <DropdownMenuItem onClick={handleEdit} className="flex items-center gap-2 cursor-pointer py-2.5 text-sm">
          <Edit2 className="w-4 h-4 text-gray-400" />
          <span>Edit</span>
        </DropdownMenuItem>
      )}

      {isOwn && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => { setShowDeleteConfirm(true); setIsMenuOpen(false) }}
            className="flex items-center gap-2 cursor-pointer py-2.5 text-sm text-red-500 focus:text-red-500 focus:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </>
      )}
    </>
  )

  return (
    <>
      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute ${isOwn ? 'right-0' : 'left-0'} bottom-full mb-2 bg-[#1e1e1e] border border-white/10 rounded-xl p-2 shadow-xl z-50`}
          >
            <div className="grid grid-cols-8 gap-1">
              {['❤️', '😂', '😍', '🔥', '👍', '👎', '😢', '😊', '🎉', '🤔', '😎', '🥰', '😭', '😡', '🤗', '🙏'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiReact(emoji)}
                  className="w-8 h-8 hover:bg-white/10 rounded flex items-center justify-center text-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isOwn ? 20 : -20 }}
        transition={{ duration: 0.2 }}
        className={`flex gap-2 md:gap-3 mb-${isGrouped ? '1' : '3'} group relative ${isOwn ? 'justify-end pr-2 md:pr-0' : 'justify-start pl-2 md:pl-0'
          }`}
      >
        {/* ── Text Message ── */}
        {message.type === 'text' && (
          <div className="flex flex-col">
            <div className={bubbleClasses}>
              {isEditing && isOwn ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                    className="w-full p-2 bg-white/10 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-white/30 text-sm resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-white/60 hover:text-white hover:bg-white/10" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-0" onClick={handleSaveEdit}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="break-words text-sm md:text-[15px] leading-relaxed">{message.content}</p>
                  {isOwn && (
                    <div className="flex items-center justify-end gap-1 mt-1">
                      {message.status === 'read' ? <CheckCheck className="w-3.5 h-3.5 text-white/70" />
                        : message.status === 'delivered' ? <CheckCheck className="w-3.5 h-3.5 text-white/70" />
                          : <Check className="w-3.5 h-3.5 text-white/70" />
                      }
                    </div>
                  )}
                </>
              )}
            </div>
            {message.reactions && message.reactions.length > 0 && (
              <EmojiReactions reactions={message.reactions} isOwn={isOwn} />
            )}
          </div>
        )}

        {/* ── Audio/Voice Message ── */}
        {message.type === 'audio' && (
          <div className="flex flex-col">
            <div className={`${bubbleClasses} flex items-center gap-2 md:gap-3`}>
              <WaveformPlayer audioUrl={message.fileUrl} isOwn={isOwn} />
            </div>
          </div>
        )}

        {/* ── Image Message ── */}
        {message.type === 'image' && (
          <div className="flex flex-col relative z-10">
            <div className="relative inline-block group/img">
              {message.fileUrl ? (
                <img
                  src={message.fileUrl}
                  alt={message.fileName || 'Image'}
                  className="w-52 md:w-64 h-auto rounded-2xl object-cover cursor-pointer shadow-lg"
                  onClick={() => setLightboxOpen(true)}
                />
              ) : (
                <div className="w-52 h-36 rounded-2xl bg-white/5 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-500" />
                </div>
              )}

              {/* Overlay hint on hover */}
              <div
                className="absolute inset-0 rounded-2xl bg-black/0 group-hover/img:bg-black/25 transition-all cursor-pointer flex items-center justify-center"
                onClick={() => setLightboxOpen(true)}
              >
                <Eye className="w-7 h-7 text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow" />
              </div>

              {/* ⋮ menu button */}
              <div className="absolute top-2 right-2 z-20 opacity-0 group-hover/img:opacity-100 transition-opacity">
                <DropdownMenu open={isImageMenuOpen} onOpenChange={setIsImageMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <button className="w-7 h-7 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors shadow">
                      <MoreVertical className="w-4 h-4 text-white" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="bottom"
                    sideOffset={6}
                    className="w-44 bg-[#1e1e1e] border border-white/10 text-white shadow-2xl rounded-xl p-1"
                  >
                    <ImageMenuItems />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {message.reactions && message.reactions.length > 0 && (
              <EmojiReactions reactions={message.reactions} isOwn={isOwn} />
            )}
          </div>
        )}

        {/* ── File Message ── */}
        {message.type === 'file' && (
          <div className="flex flex-col max-w-2xl">
            <DocumentPreview
              fileName={message.fileName}
              fileSize={message.fileSize}
              fileUrl={message.fileUrl}
              fileMimeType={message.fileMimeType}
              isOwn={isOwn}
            />
          </div>
        )}

        {/* ── Hover actions (non-image messages) ── */}
        {message.type !== 'image' && (
          <div className={`flex items-center self-end mb-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? 'order-first mr-1' : 'order-last ml-1'}`}>
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isOwn ? 'end' : 'start'}
                sideOffset={6}
                className="w-44 bg-[#1e1e1e] border border-white/10 text-white shadow-2xl rounded-xl p-1"
              >
                <TextMenuItems />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </motion.div>

      {/* ── Image Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && message.type === 'image' && message.fileUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
            onClick={() => { setLightboxOpen(false); setZoom(1) }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-sm flex-shrink-0" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col">
                <span className="text-white text-sm font-medium">{message.senderName}</span>
                <span className="text-gray-400 text-xs">{formatTime(message.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleZoom}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  title={zoom === 1 ? 'Zoom in' : 'Zoom out'}
                >
                  {zoom === 1
                    ? <ZoomIn className="w-4 h-4 text-white" />
                    : <ZoomOut className="w-4 h-4 text-white" />
                  }
                </button>
                <button
                  onClick={handleDownload}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => { setLightboxOpen(false); setZoom(1) }}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Image viewer */}
            <div className="flex-1 flex items-center justify-center overflow-auto p-4" onClick={e => { if (zoom === 1) { setLightboxOpen(false); setZoom(1) } }}>
              <motion.img
                src={message.fileUrl}
                alt={message.fileName || 'Image'}
                animate={{ scale: zoom }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="max-w-full max-h-full object-contain rounded-lg select-none"
                style={{ cursor: zoom > 1 ? 'zoom-out' : 'zoom-in' }}
                onClick={(e) => { e.stopPropagation(); toggleZoom() }}
              />
            </div>

            {/* Footer */}
            {message.fileName && (
              <div className="px-4 py-3 bg-black/40 backdrop-blur-sm text-center flex-shrink-0" onClick={e => e.stopPropagation()}>
                <span className="text-gray-400 text-xs">{message.fileName}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation ── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-5 w-full max-w-sm shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-white font-semibold text-center text-base mb-1">Delete Message?</h3>
              <p className="text-gray-400 text-sm text-center mb-5">This message will be permanently deleted.</p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1 h-10 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-10 text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl border-0"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
