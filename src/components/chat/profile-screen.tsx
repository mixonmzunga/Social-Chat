'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Camera, Check, Loader2, ChevronRight
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useChatStore } from '@/store/chat-store'
import { useToast } from '@/hooks/use-toast'

interface ProfileScreenProps {
  onBack?: () => void
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { currentUser, setCurrentUser, setCurrentView } = useChatStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [name, setName] = useState(currentUser?.name || '')
  const [username, setUsername] = useState(currentUser?.username || '')
  const [phone, setPhone] = useState(currentUser?.phone || '')
  const [bio, setBio] = useState(currentUser?.bio || '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser?.avatar || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Track which field is being edited
  const [editingField, setEditingField] = useState<string | null>(null)

  // Detect mobile
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Sync form state with currentUser changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '')
      setUsername(currentUser.username || '')
      setPhone(currentUser.phone || '')
      setBio(currentUser.bio || '')
      setAvatarPreview(currentUser.avatar || null)
    }
  }, [currentUser])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file',
          description: 'Please select an image file',
          variant: 'destructive'
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Image must be less than 5MB',
          variant: 'destructive'
        })
        return
      }

      setAvatarFile(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
        // Auto-save avatar
        saveAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveAvatar = async (avatarUrl: string | null) => {
    if (!currentUser) return
    
    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarUrl })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update')
      }
      
      setCurrentUser({ ...currentUser, ...data.user })
      setAvatarFile(null)
      toast({
        title: 'Photo updated',
        description: 'Profile photo has been updated'
      })
    } catch (error) {
      console.error('Failed to save avatar:', error)
      toast({
        title: 'Error',
        description: 'Failed to update photo',
        variant: 'destructive'
      })
    }
  }

  const saveField = async (field: string, value: string) => {
    if (!currentUser) return
    
    // Validate username format
    if (field === 'username' && value && !/^[a-zA-Z0-9_]+$/.test(value)) {
      toast({
        title: 'Invalid username',
        description: 'Username can only contain letters, numbers, and underscores',
        variant: 'destructive'
      })
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          [field]: value || null
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }
      
      setCurrentUser({ ...currentUser, ...data.user })
      setEditingField(null)
      toast({
        title: 'Saved',
        description: 'Your profile has been updated'
      })
    } catch (error) {
      console.error('Failed to save:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      setCurrentView('settings')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, field: string, value: string) => {
    if (e.key === 'Enter') {
      saveField(field, value)
    } else if (e.key === 'Escape') {
      setEditingField(null)
      // Reset to current user value
      if (field === 'name') setName(currentUser?.name || '')
      if (field === 'username') setUsername(currentUser?.username || '')
      if (field === 'phone') setPhone(currentUser?.phone || '')
      if (field === 'bio') setBio(currentUser?.bio || '')
    }
  }

  // Classic WhatsApp-style colors
  const bgColor = '#111b21'
  const headerBg = '#202c33'
  const accentColor = '#00a884'
  const textPrimary = '#e9edef'
  const textSecondary = '#8696a0'
  const borderColor = '#2a3942'

  return (
    <div className="h-full flex flex-col" style={{ background: bgColor }}>
      {/* Header */}
      <header 
        className="px-4 py-3 flex items-center gap-4 flex-shrink-0"
        style={{ background: headerBg }}
      >
        {isMobile && (
          <button
            onClick={handleBack}
            className="p-1 hover:opacity-80 transition-opacity"
            style={{ color: textSecondary }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-medium" style={{ color: textPrimary }}>
          Profile
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
        <div className="max-w-lg mx-auto">
          
          {/* Avatar Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-8"
          >
            <div 
              className="relative group cursor-pointer"
              onClick={handleAvatarClick}
            >
              <Avatar className="w-40 h-40 ring-2 ring-offset-4" style={{ '--tw-ring-color': borderColor, '--tw-ring-offset-color': bgColor } as React.CSSProperties}>
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="text-4xl font-light" style={{ background: accentColor, color: textPrimary }}>
                  {currentUser ? getInitials(currentUser.name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div 
                className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                style={{ background: 'rgba(0,0,0,0.5)' }}
              >
                <div className="flex flex-col items-center gap-1" style={{ color: textPrimary }}>
                  <Camera className="w-8 h-8" />
                  <span className="text-xs">Change photo</span>
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </motion.div>

          {/* Profile Fields - Classic WhatsApp Style */}
          <div className="px-0">
            
            {/* Name Field */}
            <div 
              className="px-6 py-4 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ borderBottom: `1px solid ${borderColor}` }}
              onClick={() => setEditingField('name')}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: accentColor }}>
                    Name
                  </p>
                  {editingField === 'name' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 'name', name)}
                        onBlur={() => saveField('name', name)}
                        className="flex-1 bg-transparent outline-none text-base"
                        style={{ color: textPrimary }}
                        autoFocus
                      />
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: accentColor }} />
                      ) : (
                        <Check className="w-4 h-4" style={{ color: accentColor }} />
                      )}
                    </div>
                  ) : (
                    <p className="text-base" style={{ color: textPrimary }}>{name || 'Add name'}</p>
                  )}
                </div>
                {editingField !== 'name' && (
                  <ChevronRight className="w-5 h-5" style={{ color: textSecondary }} />
                )}
              </div>
            </div>

            {/* Username Field */}
            <div 
              className="px-6 py-4 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ borderBottom: `1px solid ${borderColor}` }}
              onClick={() => setEditingField('username')}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: accentColor }}>
                    Username
                  </p>
                  {editingField === 'username' ? (
                    <div className="flex items-center gap-2">
                      <span style={{ color: textSecondary }}>@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''))}
                        onKeyDown={(e) => handleKeyDown(e, 'username', username)}
                        onBlur={() => saveField('username', username)}
                        className="flex-1 bg-transparent outline-none text-base"
                        style={{ color: textPrimary }}
                        autoFocus
                      />
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: accentColor }} />
                      ) : (
                        <Check className="w-4 h-4" style={{ color: accentColor }} />
                      )}
                    </div>
                  ) : (
                    <p className="text-base" style={{ color: textPrimary }}>
                      {username ? `@${username}` : 'Add username'}
                    </p>
                  )}
                </div>
                {editingField !== 'username' && (
                  <ChevronRight className="w-5 h-5" style={{ color: textSecondary }} />
                )}
              </div>
            </div>

            {/* Bio Field */}
            <div 
              className="px-6 py-4 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ borderBottom: `1px solid ${borderColor}` }}
              onClick={() => setEditingField('bio')}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: accentColor }}>
                    About
                  </p>
                  {editingField === 'bio' ? (
                    <div className="flex items-start gap-2">
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        onBlur={() => saveField('bio', bio)}
                        className="flex-1 bg-transparent outline-none text-base resize-none"
                        style={{ color: textPrimary, minHeight: '60px' }}
                        placeholder="Hey there! I'm using LoyalChat"
                        autoFocus
                      />
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mt-1" style={{ color: accentColor }} />
                      ) : (
                        <Check 
                          className="w-4 h-4 cursor-pointer mt-1" 
                          style={{ color: accentColor }}
                          onClick={() => saveField('bio', bio)}
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-base" style={{ color: textPrimary }}>
                      {bio || 'Hey there! I\'m using LoyalChat'}
                    </p>
                  )}
                </div>
                {editingField !== 'bio' && (
                  <ChevronRight className="w-5 h-5 mt-1" style={{ color: textSecondary }} />
                )}
              </div>
            </div>

            {/* Phone Field */}
            <div 
              className="px-6 py-4 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ borderBottom: `1px solid ${borderColor}` }}
              onClick={() => setEditingField('phone')}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: accentColor }}>
                    Phone
                  </p>
                  {editingField === 'phone' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 'phone', phone)}
                        onBlur={() => saveField('phone', phone)}
                        className="flex-1 bg-transparent outline-none text-base"
                        style={{ color: textPrimary }}
                        placeholder="+1 (555) 000-0000"
                        autoFocus
                      />
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: accentColor }} />
                      ) : (
                        <Check className="w-4 h-4" style={{ color: accentColor }} />
                      )}
                    </div>
                  ) : (
                    <p className="text-base" style={{ color: textPrimary }}>{phone || 'Add phone'}</p>
                  )}
                </div>
                {editingField !== 'phone' && (
                  <ChevronRight className="w-5 h-5" style={{ color: textSecondary }} />
                )}
              </div>
            </div>

            {/* Email Field (Read-only) */}
            <div 
              className="px-6 py-4"
              style={{ borderBottom: `1px solid ${borderColor}` }}
            >
              <div>
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: accentColor }}>
                  Email
                </p>
                <p className="text-base" style={{ color: textPrimary }}>{currentUser?.email || 'No email'}</p>
                <p className="text-xs mt-1" style={{ color: textSecondary }}>
                  Email cannot be changed
                </p>
              </div>
            </div>

          </div>

          {/* Info Section */}
          <div className="px-6 py-6 text-center">
            <p className="text-xs" style={{ color: textSecondary }}>
              Tap on any field to edit. Changes are saved automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
