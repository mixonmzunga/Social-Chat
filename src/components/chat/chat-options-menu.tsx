'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MoreVertical, X, Search, User, Palette, Trash2, MessageSquare,
  Settings, Info, Moon, Sun, Bell, BellOff, Archive, Star,
  Ban, Flag, Download, Share2, Copy, Check, Phone, Video
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useChatStore } from '@/store/chat-store'

interface ChatOptionsMenuProps {
  conversationId: string
  otherUserId?: string
  otherUserName: string
  otherUserAvatar?: string
}

export function ChatOptionsMenu({
  conversationId,
  otherUserId,
  otherUserName,
  otherUserAvatar
}: ChatOptionsMenuProps) {
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showClearChat, setShowClearChat] = useState(false)
  const [showThemeDialog, setShowThemeDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isArchived, setIsArchived] = useState(false)
  const [isStarred, setIsStarred] = useState(false)

  const { selectedConversation, setMessages, setSelectedConversation } = useChatStore()

  const handleClearChat = async () => {
    try {
      // TODO: Implement clear chat API call
      console.log('Clear chat:', conversationId)
      setMessages([])
      setShowClearChat(false)
    } catch (error) {
      console.error('Failed to clear chat:', error)
    }
  }

  const handleCloseChat = () => {
    setSelectedConversation(null)
  }

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // TODO: Implement theme switching
    document.documentElement.classList.toggle('dark')
  }

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
    // TODO: Implement mute/unmute functionality
    console.log('Toggle mute:', !isMuted)
  }

  const handleArchive = () => {
    setIsArchived(!isArchived)
    // TODO: Implement archive functionality
    console.log('Archive chat:', !isArchived)
  }

  const handleStarChat = () => {
    setIsStarred(!isStarred)
    // TODO: Implement star chat functionality
    console.log('Star chat:', !isStarred)
  }

  const handleBlockUser = () => {
    // TODO: Implement block user functionality
    console.log('Block user:', otherUserId)
  }

  const handleReportUser = () => {
    // TODO: Implement report user functionality
    console.log('Report user:', otherUserId)
  }

  const handleExportChat = () => {
    // TODO: Implement export chat functionality
    console.log('Export chat:', conversationId)
  }

  const handleShareChat = () => {
    // TODO: Implement share chat functionality
    console.log('Share chat:', conversationId)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-gray-600 dark:text-gray-400">
            <MoreVertical className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10">
          {/* Search */}
          <DropdownMenuItem onClick={() => setShowSearch(true)} className="cursor-pointer">
            <Search className="w-4 h-4 mr-2" />
            Search
          </DropdownMenuItem>

          {/* Contact Info */}
          <DropdownMenuItem onClick={() => setShowContactInfo(true)} className="cursor-pointer">
            <Info className="w-4 h-4 mr-2" />
            Contact Info
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Chat Theme */}
          <DropdownMenuItem onClick={() => setShowThemeDialog(true)} className="cursor-pointer">
            <Palette className="w-4 h-4 mr-2" />
            Chat Theme
          </DropdownMenuItem>

          {/* Mute/Unmute */}
          <DropdownMenuItem onClick={handleToggleMute} className="cursor-pointer">
            {isMuted ? <Bell className="w-4 h-4 mr-2" /> : <BellOff className="w-4 h-4 mr-2" />}
            {isMuted ? 'Unmute Chat' : 'Mute Chat'}
          </DropdownMenuItem>

          {/* Archive */}
          <DropdownMenuItem onClick={handleArchive} className="cursor-pointer">
            <Archive className="w-4 h-4 mr-2" />
            {isArchived ? 'Unarchive Chat' : 'Archive Chat'}
          </DropdownMenuItem>

          {/* Star */}
          <DropdownMenuItem onClick={handleStarChat} className="cursor-pointer">
            <Star className={`w-4 h-4 mr-2 ${isStarred ? 'text-yellow-500 fill-yellow-500' : ''}`} />
            {isStarred ? 'Unstar Chat' : 'Star Chat'}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Export */}
          <DropdownMenuItem onClick={handleExportChat} className="cursor-pointer">
            <Download className="w-4 h-4 mr-2" />
            Export Chat
          </DropdownMenuItem>

          {/* Share */}
          <DropdownMenuItem onClick={handleShareChat} className="cursor-pointer">
            <Share2 className="w-4 h-4 mr-2" />
            Share Chat
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Clear Chat */}
          <DropdownMenuItem onClick={() => setShowClearChat(true)} className="cursor-pointer text-red-600 dark:text-red-400">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Chat
          </DropdownMenuItem>

          {/* Close Chat */}
          <DropdownMenuItem onClick={handleCloseChat} className="cursor-pointer">
            <X className="w-4 h-4 mr-2" />
            Close Chat
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Block User */}
          <DropdownMenuItem onClick={handleBlockUser} className="cursor-pointer text-red-600 dark:text-red-400">
            <Ban className="w-4 h-4 mr-2" />
            Block User
          </DropdownMenuItem>

          {/* Report User */}
          <DropdownMenuItem onClick={handleReportUser} className="cursor-pointer text-red-600 dark:text-red-400">
            <Flag className="w-4 h-4 mr-2" />
            Report User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Contact Info Dialog */}
      <Dialog open={showContactInfo} onOpenChange={setShowContactInfo}>
        <DialogContent className="bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Contact Info</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              View information about {otherUserName}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              {otherUserAvatar ? (
                <img src={otherUserAvatar} alt={otherUserName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {otherUserName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{otherUserName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active now</p>
            </div>
            <div className="w-full space-y-2">
              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" className="w-full">
                <Phone className="w-4 h-4 mr-2" />
                Voice Call
              </Button>
              <Button variant="outline" className="w-full">
                <Video className="w-4 h-4 mr-2" />
                Video Call
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search Dialog */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Search in Chat</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Search for messages in this conversation
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-slate-700 border-gray-300 dark:border-white/20"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSearch(false)}>
              Cancel
            </Button>
            <Button>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Chat Confirmation */}
      <Dialog open={showClearChat} onOpenChange={setShowClearChat}>
        <DialogContent className="bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Clear Chat?</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              This will delete all messages in this chat. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearChat(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearChat}>
              Clear Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Theme Dialog */}
      <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
        <DialogContent className="bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Chat Theme</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Customize the appearance of this chat
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-900 dark:text-white">Dark Mode</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleTheme}
                className="p-2"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'].map((color) => (
                <button
                  key={color}
                  className={`w-12 h-12 rounded-lg ${color} hover:scale-110 transition-transform`}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowThemeDialog(false)}>
              Cancel
            </Button>
            <Button>
              <Palette className="w-4 h-4 mr-2" />
              Apply Theme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
