'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Camera, Check, Loader2, ChevronRight,
  Calendar, MessageSquare, Users, Shield, Bell, Database,
  Download, Trash2, Eye, EyeOff, Clock, Globe, Cake,
  MapPin, Link, Lock, Key, Smartphone, Mail, Volume2,
  Vibrate, Wifi, HardDrive, FileText, AlertCircle,
  LogOut, Settings, HelpCircle, Info, User as UserIcon,
  Edit3, Upload, X, Briefcase, Building, Linkedin,
  Twitter, Instagram, UserCircle, Award, Languages,
  Clock3, CheckCircle2, Circle
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useChatStore } from '@/store/chat-store'
import { useToast } from '@/hooks/use-toast'

interface ProfileScreenProps {
  onBack?: () => void
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { currentUser, setCurrentUser, setCurrentView, logout } = useChatStore()
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
  
  // Additional profile fields
  const [location, setLocation] = useState(currentUser?.location || '')
  const [website, setWebsite] = useState(currentUser?.website || '')
  const [birthday, setBirthday] = useState(currentUser?.birthday || '')
  const [jobTitle, setJobTitle] = useState(currentUser?.jobTitle || '')
  const [company, setCompany] = useState(currentUser?.company || '')
  const [linkedin, setLinkedin] = useState(currentUser?.linkedin || '')
  const [twitter, setTwitter] = useState(currentUser?.twitter || '')
  const [instagram, setInstagram] = useState(currentUser?.instagram || '')
  const [gender, setGender] = useState(currentUser?.gender || '')
  const [language, setLanguage] = useState(currentUser?.language || 'English')
  const [timezone, setTimezone] = useState(currentUser?.timezone || 'UTC')
  
  // Profile image upload states
  const [isDragging, setIsDragging] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [tempImage, setTempImage] = useState<string | null>(null)
  
  // Privacy settings
  const [lastSeenPrivacy, setLastSeenPrivacy] = useState<'everyone' | 'contacts' | 'nobody'>('everyone')
  const [profilePhotoPrivacy, setProfilePhotoPrivacy] = useState<'everyone' | 'contacts' | 'nobody'>('everyone')
  const [onlineStatusPrivacy, setOnlineStatusPrivacy] = useState<'everyone' | 'contacts' | 'nobody'>('everyone')
  const [readReceipts, setReadReceipts] = useState(true)
  
  // Security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Notification settings
  const [messageNotifications, setMessageNotifications] = useState(true)
  const [groupNotifications, setGroupNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [showPreview, setShowPreview] = useState(true)
  
  // Storage settings
  const [autoDownloadPhotos, setAutoDownloadPhotos] = useState(true)
  const [autoDownloadVideos, setAutoDownloadVideos] = useState(false)
  const [autoDownloadDocuments, setAutoDownloadDocuments] = useState(false)
  const [storageUsed, setStorageUsed] = useState(125.6) // MB
  
  // Account statistics
  const [accountStats, setAccountStats] = useState({
    joinedDate: currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Unknown',
    totalMessages: 1234,
    totalContacts: 45,
    totalGroups: 8,
    totalMedia: 234
  })
  
  // UI state
  const [activeSection, setActiveSection] = useState<'profile' | 'privacy' | 'security' | 'notifications' | 'storage' | 'account'>('profile')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

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
      setLocation(currentUser.location || '')
      setWebsite(currentUser.website || '')
      setBirthday(currentUser.birthday || '')
      setJobTitle(currentUser.jobTitle || '')
      setCompany(currentUser.company || '')
      setLinkedin(currentUser.linkedin || '')
      setTwitter(currentUser.twitter || '')
      setInstagram(currentUser.instagram || '')
      setGender(currentUser.gender || '')
      setLanguage(currentUser.language || 'English')
      setTimezone(currentUser.timezone || 'UTC')
    }
  }, [currentUser])
  
  // Additional handlers
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match',
        variant: 'destructive'
      })
      return
    }
    
    if (newPassword.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters',
        variant: 'destructive'
      })
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          currentPassword,
          newPassword
        })
      })
      
      if (!response.ok) throw new Error('Failed to change password')
      
      toast({
        title: 'Password changed',
        description: 'Your password has been updated successfully'
      })
      
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleExportData = async () => {
    try {
      const response = await fetch(`/api/users/${currentUser?.id}/export`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `loyalchat-data-${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'Data exported',
        description: 'Your data has been downloaded successfully'
      })
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export your data',
        variant: 'destructive'
      })
    }
  }
  
  const handleDeleteAccount = async () => {
    if (!currentUser) return
    
    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete account')
      
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted'
      })
      
      logout()
    } catch (error) {
      toast({
        title: 'Deletion failed',
        description: 'Failed to delete your account',
        variant: 'destructive'
      })
    }
  }
  
  const handleClearCache = async () => {
    try {
      // Clear localStorage
      localStorage.clear()
      
      // Clear IndexedDB if needed
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }
      
      toast({
        title: 'Cache cleared',
        description: 'Local cache has been cleared successfully'
      })
    } catch (error) {
      toast({
        title: 'Clear failed',
        description: 'Failed to clear cache',
        variant: 'destructive'
      })
    }
  }
  
  const handleLogout = async () => {
    if (currentUser) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id })
        })
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
    logout()
  }
  
  // Enhanced image upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleImageFile(files[0])
    }
  }
  
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file',
        variant: 'destructive'
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 10MB',
        variant: 'destructive'
      })
      return
    }

    setAvatarFile(file)
    
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setTempImage(result)
      setShowImagePreview(true)
    }
    reader.readAsDataURL(file)
  }
  
  const confirmImageUpload = () => {
    if (tempImage) {
      setAvatarPreview(tempImage)
      saveAvatar(tempImage)
      setShowImagePreview(false)
      setTempImage(null)
    }
  }
  
  const cancelImageUpload = () => {
    setShowImagePreview(false)
    setTempImage(null)
    setAvatarFile(null)
  }
  
  // Profile completion calculation
  const calculateProfileCompletion = () => {
    if (!currentUser) return 0
    
    const fields = [
      currentUser.name,
      currentUser.username,
      currentUser.email,
      currentUser.phone,
      currentUser.bio,
      currentUser.avatar,
      currentUser.location,
      currentUser.website,
      currentUser.birthday,
      currentUser.jobTitle,
      currentUser.company
    ]
    
    const completedFields = fields.filter(field => field && field.trim() !== '').length
    return Math.round((completedFields / fields.length) * 100)
  }
  
  const profileCompletion = calculateProfileCompletion()

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
      if (field === 'location') setLocation(currentUser?.location || '')
      if (field === 'website') setWebsite(currentUser?.website || '')
      if (field === 'birthday') setBirthday(currentUser?.birthday || '')
      if (field === 'jobTitle') setJobTitle(currentUser?.jobTitle || '')
      if (field === 'company') setCompany(currentUser?.company || '')
      if (field === 'linkedin') setLinkedin(currentUser?.linkedin || '')
      if (field === 'twitter') setTwitter(currentUser?.twitter || '')
      if (field === 'instagram') setInstagram(currentUser?.instagram || '')
      if (field === 'gender') setGender(currentUser?.gender || '')
      if (field === 'language') setLanguage(currentUser?.language || 'English')
      if (field === 'timezone') setTimezone(currentUser?.timezone || 'UTC')
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
          {activeSection === 'profile' ? 'Profile' : 
           activeSection === 'privacy' ? 'Privacy' :
           activeSection === 'security' ? 'Security' :
           activeSection === 'notifications' ? 'Notifications' :
           activeSection === 'storage' ? 'Storage' :
           activeSection === 'account' ? 'Account' : 'Settings'}
        </h1>
      </header>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto scrollbar-thin px-4 py-2 gap-2" style={{ background: headerBg, borderBottom: `1px solid ${borderColor}` }}>
        {[
          { id: 'profile', label: 'Profile', icon: UserIcon },
          { id: 'privacy', label: 'Privacy', icon: Shield },
          { id: 'security', label: 'Security', icon: Lock },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'storage', label: 'Storage', icon: HardDrive },
          { id: 'account', label: 'Account', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeSection === tab.id
                ? 'opacity-100'
                : 'opacity-60 hover:opacity-80'
            }`}
            style={{
              background: activeSection === tab.id ? accentColor : 'transparent',
              color: textPrimary
            }}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
        <div className="max-w-lg mx-auto">
          
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4"
            >
              {/* Profile Completion Indicator */}
              <div className="px-6 py-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5" style={{ color: accentColor }} />
                    <span className="text-sm font-medium" style={{ color: textPrimary }}>Profile Completion</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: accentColor }}>{profileCompletion}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${profileCompletion}%`,
                      background: accentColor 
                    }}
                  />
                </div>
                <p className="text-xs mt-2" style={{ color: textSecondary }}>
                  Complete your profile to get the most out of LoyalChat
                </p>
              </div>

              {/* Enhanced Avatar Section */}
              <div className="px-6 py-6">
                <div className="flex flex-col items-center">
                  <div 
                    className={`relative mb-4 transition-all ${
                      isDragging ? 'scale-105 opacity-80' : ''
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div 
                      className="relative group cursor-pointer"
                      onClick={handleAvatarClick}
                    >
                      <Avatar className="w-32 h-32 ring-4 ring-offset-4" style={{ 
                        '--tw-ring-color': borderColor, 
                        '--tw-ring-offset-color': bgColor 
                      } as React.CSSProperties}>
                        <AvatarImage src={avatarPreview || undefined} />
                        <AvatarFallback className="text-3xl font-light" style={{ 
                          background: accentColor, 
                          color: textPrimary 
                        }}>
                          {currentUser ? getInitials(currentUser.name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div 
                        className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        style={{ background: 'rgba(0,0,0,0.7)' }}
                      >
                        <div className="flex flex-col items-center gap-1" style={{ color: textPrimary }}>
                          <Upload className="w-6 h-6" />
                          <span className="text-xs font-medium">{avatarPreview ? 'Change' : 'Upload'}</span>
                        </div>
                      </div>
                    </div>
                    {isDragging && (
                      <div className="absolute inset-0 rounded-full border-4 border-dashed flex items-center justify-center" style={{ borderColor: accentColor }}>
                        <div className="text-center" style={{ color: textPrimary }}>
                          <Upload className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-xs font-medium">Drop image here</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold mb-1" style={{ color: textPrimary }}>
                      {currentUser?.name || 'Your Name'}
                    </h2>
                    {currentUser?.username && (
                      <p className="text-sm" style={{ color: textSecondary }}>@{currentUser.username}</p>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageFile(file)
                    }}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Profile Fields - Organized in Sections */}
              <div className="px-0">
                {/* Basic Information */}
                <div className="mb-6">
                  <div className="px-6 mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentColor }}>
                      Basic Information
                    </h3>
                  </div>
                  {[
                    { field: 'name', label: 'Full Name', value: name, setter: setName, icon: UserIcon, required: true },
                    { field: 'email', label: 'Email Address', value: currentUser?.email || '', setter: () => {}, icon: Mail, readonly: true },
                    { field: 'phone', label: 'Phone Number', value: phone, setter: setPhone, icon: Smartphone },
                    { field: 'username', label: 'Username', value: username, setter: setUsername, icon: '@', prefix: '@' },
                    { field: 'bio', label: 'Bio', value: bio, setter: setBio, icon: MessageSquare, textarea: true }
                  ].map(({ field, label, value, setter, icon, prefix, textarea, readonly, required }) => (
                    <div 
                      key={field}
                      className={`px-6 py-4 ${readonly ? '' : 'cursor-pointer hover:opacity-90'} transition-opacity`}
                      style={{ borderBottom: `1px solid ${borderColor}` }}
                      onClick={() => !readonly && setEditingField(field)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {typeof icon === 'string' ? (
                              <span className="text-sm" style={{ color: accentColor }}>{icon}</span>
                            ) : (
                              <icon className="w-4 h-4" style={{ color: accentColor }} />
                            )}
                            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: accentColor }}>
                              {label}
                              {required && <span className="text-red-500 ml-1">*</span>}
                            </p>
                          </div>
                          {editingField === field && !readonly ? (
                            <div className={`flex items-start gap-2 ${textarea ? 'items-start' : ''}`}>
                              {prefix && <span style={{ color: textSecondary, marginTop: textarea ? '16px' : '0' }}>{prefix}</span>}
                              {textarea ? (
                                <textarea
                                  value={value}
                                  onChange={(e) => setter(e.target.value)}
                                  onBlur={() => saveField(field, value)}
                                  className="flex-1 bg-transparent outline-none text-base resize-none"
                                  style={{ color: textPrimary, minHeight: '80px' }}
                                  placeholder={`Tell us about yourself...`}
                                  autoFocus
                                />
                              ) : (
                                <input
                                  type={field === 'phone' ? 'tel' : 'text'}
                                  value={value}
                                  onChange={(e) => setter(e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, field, value)}
                                  onBlur={() => saveField(field, value)}
                                  className="flex-1 bg-transparent outline-none text-base"
                                  style={{ color: textPrimary }}
                                  placeholder={`Enter ${label.toLowerCase()}`}
                                  autoFocus
                                />
                              )}
                              {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mt-1" style={{ color: accentColor }} />
                              ) : (
                                <Check 
                                  className={`w-4 h-4 cursor-pointer ${textarea ? 'mt-1' : ''}`} 
                                  style={{ color: accentColor }}
                                  onClick={() => saveField(field, value)}
                                />
                              )}
                            </div>
                          ) : (
                            <div>
                              <p className="text-base" style={{ color: textPrimary }}>
                                {value || (prefix ? `${prefix}add ${label.toLowerCase()}` : `Add ${label}`)}
                              </p>
                              {readonly && field === 'email' && (
                                <p className="text-xs mt-1" style={{ color: textSecondary }}>
                                  Email cannot be changed
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        {editingField !== field && !readonly && (
                          <ChevronRight className={`w-5 h-5 ${textarea ? 'mt-1' : ''} flex-shrink-0`} style={{ color: textSecondary }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Professional Information */}
                <div className="mb-6">
                  <div className="px-6 mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentColor }}>
                      Professional Information
                    </h3>
                  </div>
                  {[
                    { field: 'jobTitle', label: 'Job Title', value: jobTitle, setter: setJobTitle, icon: Briefcase },
                    { field: 'company', label: 'Company', value: company, setter: setCompany, icon: Building }
                  ].map(({ field, label, value, setter, icon }) => (
                    <div 
                      key={field}
                      className="px-6 py-4 cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ borderBottom: `1px solid ${borderColor}` }}
                      onClick={() => setEditingField(field)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <icon className="w-4 h-4" style={{ color: accentColor }} />
                            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: accentColor }}>
                              {label}
                            </p>
                          </div>
                          {editingField === field ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => setter(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, field, value)}
                                onBlur={() => saveField(field, value)}
                                className="flex-1 bg-transparent outline-none text-base"
                                style={{ color: textPrimary }}
                                placeholder={`Enter ${label.toLowerCase()}`}
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
                              {value || `Add ${label.toLowerCase()}`}
                            </p>
                          )}
                        </div>
                        {editingField !== field && (
                          <ChevronRight className="w-5 h-5" style={{ color: textSecondary }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Personal Information */}
                <div className="mb-6">
                  <div className="px-6 mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentColor }}>
                      Personal Information
                    </h3>
                  </div>
                  {[
                    { field: 'location', label: 'Location', value: location, setter: setLocation, icon: MapPin },
                    { field: 'birthday', label: 'Birthday', value: birthday, setter: setBirthday, icon: Cake },
                    { field: 'gender', label: 'Gender', value: gender, setter: setGender, icon: UserCircle },
                    { field: 'language', label: 'Language', value: language, setter: setLanguage, icon: Languages },
                    { field: 'timezone', label: 'Timezone', value: timezone, setter: setTimezone, icon: Clock3 }
                  ].map(({ field, label, value, setter, icon }) => (
                    <div 
                      key={field}
                      className="px-6 py-4 cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ borderBottom: `1px solid ${borderColor}` }}
                      onClick={() => setEditingField(field)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <icon className="w-4 h-4" style={{ color: accentColor }} />
                            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: accentColor }}>
                              {label}
                            </p>
                          </div>
                          {editingField === field ? (
                            <div className="flex items-center gap-2">
                              {field === 'language' ? (
                                <select
                                  value={value}
                                  onChange={(e) => setter(e.target.value)}
                                  onBlur={() => saveField(field, value)}
                                  className="flex-1 bg-transparent outline-none text-base"
                                  style={{ color: textPrimary }}
                                  autoFocus
                                >
                                  <option value="English" style={{ background: headerBg }}>English</option>
                                  <option value="Spanish" style={{ background: headerBg }}>Spanish</option>
                                  <option value="French" style={{ background: headerBg }}>French</option>
                                  <option value="German" style={{ background: headerBg }}>German</option>
                                  <option value="Chinese" style={{ background: headerBg }}>Chinese</option>
                                </select>
                              ) : field === 'gender' ? (
                                <select
                                  value={value}
                                  onChange={(e) => setter(e.target.value)}
                                  onBlur={() => saveField(field, value)}
                                  className="flex-1 bg-transparent outline-none text-base"
                                  style={{ color: textPrimary }}
                                  autoFocus
                                >
                                  <option value="" style={{ background: headerBg }}>Select Gender</option>
                                  <option value="Male" style={{ background: headerBg }}>Male</option>
                                  <option value="Female" style={{ background: headerBg }}>Female</option>
                                  <option value="Other" style={{ background: headerBg }}>Other</option>
                                  <option value="Prefer not to say" style={{ background: headerBg }}>Prefer not to say</option>
                                </select>
                              ) : (
                                <input
                                  type={field === 'birthday' ? 'date' : 'text'}
                                  value={value}
                                  onChange={(e) => setter(e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, field, value)}
                                  onBlur={() => saveField(field, value)}
                                  className="flex-1 bg-transparent outline-none text-base"
                                  style={{ color: textPrimary }}
                                  placeholder={`Enter ${label.toLowerCase()}`}
                                  autoFocus
                                />
                              )}
                              {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" style={{ color: accentColor }} />
                              ) : (
                                <Check className="w-4 h-4" style={{ color: accentColor }} />
                              )}
                            </div>
                          ) : (
                            <p className="text-base" style={{ color: textPrimary }}>
                              {value || `Add ${label.toLowerCase()}`}
                            </p>
                          )}
                        </div>
                        {editingField !== field && (
                          <ChevronRight className="w-5 h-5" style={{ color: textSecondary }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Social Links */}
                <div className="mb-6">
                  <div className="px-6 mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentColor }}>
                      Social Links
                    </h3>
                  </div>
                  {[
                    { field: 'website', label: 'Website', value: website, setter: setWebsite, icon: Link, prefix: 'https://' },
                    { field: 'linkedin', label: 'LinkedIn', value: linkedin, setter: setLinkedin, icon: Linkedin, prefix: 'linkedin.com/in/' },
                    { field: 'twitter', label: 'Twitter', value: twitter, setter: setTwitter, icon: Twitter, prefix: '@' },
                    { field: 'instagram', label: 'Instagram', value: instagram, setter: setInstagram, icon: Instagram, prefix: '@' }
                  ].map(({ field, label, value, setter, icon, prefix }) => (
                    <div 
                      key={field}
                      className="px-6 py-4 cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ borderBottom: `1px solid ${borderColor}` }}
                      onClick={() => setEditingField(field)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <icon className="w-4 h-4" style={{ color: accentColor }} />
                            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: accentColor }}>
                              {label}
                            </p>
                          </div>
                          {editingField === field ? (
                            <div className="flex items-center gap-2">
                              {prefix && prefix !== 'https://' && (
                                <span style={{ color: textSecondary }}>{prefix}</span>
                              )}
                              <input
                                type={field === 'website' ? 'url' : 'text'}
                                value={value}
                                onChange={(e) => setter(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, field, value)}
                                onBlur={() => saveField(field, value)}
                                className="flex-1 bg-transparent outline-none text-base"
                                style={{ color: textPrimary }}
                                placeholder={`${prefix}${field === 'website' ? 'yourwebsite.com' : 'username'}`}
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
                              {value ? (
                                field === 'website' ? (
                                  <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" style={{ color: accentColor }}>
                                    {value}
                                  </a>
                                ) : (
                                  `${prefix}${value}`
                                )
                              ) : (
                                `Add ${label.toLowerCase()}`
                              )}
                            </p>
                          )}
                        </div>
                        {editingField !== field && (
                          <ChevronRight className="w-5 h-5" style={{ color: textSecondary }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Privacy Section */}
          {activeSection === 'privacy' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4"
            >
              <div className="px-0">
                {[
                  {
                    title: 'Last Seen & Online',
                    description: 'Control who can see when you were last online',
                    value: lastSeenPrivacy,
                    setter: setLastSeenPrivacy,
                    options: ['everyone', 'contacts', 'nobody']
                  },
                  {
                    title: 'Profile Photo',
                    description: 'Control who can see your profile photo',
                    value: profilePhotoPrivacy,
                    setter: setProfilePhotoPrivacy,
                    options: ['everyone', 'contacts', 'nobody']
                  },
                  {
                    title: 'Online Status',
                    description: 'Control who can see when you are online',
                    value: onlineStatusPrivacy,
                    setter: setOnlineStatusPrivacy,
                    options: ['everyone', 'contacts', 'nobody']
                  }
                ].map(({ title, description, value, setter, options }) => (
                  <div 
                    key={title}
                    className="px-6 py-4"
                    style={{ borderBottom: `1px solid ${borderColor}` }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: textPrimary }}>{title}</p>
                      <p className="text-xs mt-1" style={{ color: textSecondary }}>{description}</p>
                      <div className="flex gap-2 mt-3">
                        {options.map((option) => (
                          <button
                            key={option}
                            onClick={() => setter(option as any)}
                            className={`px-3 py-1 rounded-full text-xs capitalize transition-all ${
                              value === option
                                ? 'opacity-100'
                                : 'opacity-60 hover:opacity-80'
                            }`}
                            style={{
                              background: value === option ? accentColor : 'transparent',
                              color: textPrimary,
                              border: `1px solid ${borderColor}`
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Read Receipts */}
                <div 
                  className="px-6 py-4"
                  style={{ borderBottom: `1px solid ${borderColor}` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: textPrimary }}>Read Receipts</p>
                      <p className="text-xs mt-1" style={{ color: textSecondary }}>
                        Let others know you have read their messages
                      </p>
                    </div>
                    <Switch
                      checked={readReceipts}
                      onCheckedChange={setReadReceipts}
                      style={{ accentColor: accentColor }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4"
            >
              <div className="px-0">
                {/* Two-Factor Authentication */}
                <div 
                  className="px-6 py-4"
                  style={{ borderBottom: `1px solid ${borderColor}` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: accentColor }}>
                        <Key className="w-4 h-4" style={{ color: textPrimary }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: textPrimary }}>Two-Factor Authentication</p>
                        <p className="text-xs mt-1" style={{ color: textSecondary }}>
                          Add an extra layer of security
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={setTwoFactorEnabled}
                      style={{ accentColor: accentColor }}
                    />
                  </div>
                </div>

                {/* Change Password */}
                <div 
                  className="px-6 py-4 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ borderBottom: `1px solid ${borderColor}` }}
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: accentColor }}>
                        <Lock className="w-4 h-4" style={{ color: textPrimary }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: textPrimary }}>Change Password</p>
                        <p className="text-xs mt-1" style={{ color: textSecondary }}>
                          Update your account password
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5" style={{ color: textSecondary }} />
                  </div>
                </div>

                {/* Password Change Form */}
                {showPasswordChange && (
                  <div className="px-6 py-4" style={{ background: headerBg }}>
                    <div className="space-y-4">
                      {[
                        { label: 'Current Password', value: currentPassword, setter: setCurrentPassword, type: 'password' },
                        { label: 'New Password', value: newPassword, setter: setNewPassword, type: 'password' },
                        { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword, type: 'password' }
                      ].map(({ label, value, setter, type }) => (
                        <div key={label}>
                          <p className="text-xs mb-1" style={{ color: textSecondary }}>{label}</p>
                          <input
                            type={type}
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-transparent outline-none"
                            style={{ 
                              color: textPrimary,
                              border: `1px solid ${borderColor}`
                            }}
                            placeholder={`Enter ${label.toLowerCase()}`}
                          />
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowPasswordChange(false)}
                          variant="outline"
                          className="flex-1"
                          style={{ borderColor: borderColor, color: textPrimary }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handlePasswordChange}
                          disabled={loading}
                          className="flex-1"
                          style={{ background: accentColor, color: textPrimary }}
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4"
            >
              <div className="px-0">
                {[
                  {
                    title: 'Message Notifications',
                    description: 'Show notifications for new messages',
                    icon: MessageSquare,
                    value: messageNotifications,
                    setter: setMessageNotifications
                  },
                  {
                    title: 'Group Notifications',
                    description: 'Show notifications for group messages',
                    icon: Users,
                    value: groupNotifications,
                    setter: setGroupNotifications
                  },
                  {
                    title: 'Sound',
                    description: 'Play sound for notifications',
                    icon: Volume2,
                    value: soundEnabled,
                    setter: setSoundEnabled
                  },
                  {
                    title: 'Vibration',
                    description: 'Vibrate for notifications',
                    icon: Vibrate,
                    value: vibrationEnabled,
                    setter: setVibrationEnabled
                  },
                  {
                    title: 'Message Preview',
                    description: 'Show message content in notifications',
                    icon: Eye,
                    value: showPreview,
                    setter: setShowPreview
                  }
                ].map(({ title, description, icon: Icon, value, setter }) => (
                  <div 
                    key={title}
                    className="px-6 py-4"
                    style={{ borderBottom: `1px solid ${borderColor}` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: accentColor }}>
                          <Icon className="w-4 h-4" style={{ color: textPrimary }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: textPrimary }}>{title}</p>
                          <p className="text-xs mt-1" style={{ color: textSecondary }}>{description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={setter}
                        style={{ accentColor: accentColor }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Storage Section */}
          {activeSection === 'storage' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4"
            >
              <div className="px-0">
                {/* Storage Usage */}
                <div className="px-6 py-4">
                  <div className="flex items-center gap-3 mb-4">
                    <HardDrive className="w-5 h-5" style={{ color: accentColor }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: textPrimary }}>Storage Usage</p>
                      <p className="text-xs mt-1" style={{ color: textSecondary }}>
                        {storageUsed.toFixed(1)} MB used
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((storageUsed / 1024) * 100, 100)}%`,
                        background: accentColor 
                      }}
                    />
                  </div>
                </div>

                {/* Auto-Download Settings */}
                {[
                  {
                    title: 'Photos',
                    description: 'Auto-download photos when connected to Wi-Fi',
                    icon: Camera,
                    value: autoDownloadPhotos,
                    setter: setAutoDownloadPhotos
                  },
                  {
                    title: 'Videos',
                    description: 'Auto-download videos when connected to Wi-Fi',
                    icon: Camera,
                    value: autoDownloadVideos,
                    setter: setAutoDownloadVideos
                  },
                  {
                    title: 'Documents',
                    description: 'Auto-download documents',
                    icon: FileText,
                    value: autoDownloadDocuments,
                    setter: setAutoDownloadDocuments
                  }
                ].map(({ title, description, icon: Icon, value, setter }) => (
                  <div 
                    key={title}
                    className="px-6 py-4"
                    style={{ borderBottom: `1px solid ${borderColor}` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: accentColor }}>
                          <Icon className="w-4 h-4" style={{ color: textPrimary }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: textPrimary }}>{title}</p>
                          <p className="text-xs mt-1" style={{ color: textSecondary }}>{description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={setter}
                        style={{ accentColor: accentColor }}
                      />
                    </div>
                  </div>
                ))}

                {/* Clear Cache Button */}
                <div className="px-6 py-4">
                  <Button
                    onClick={handleClearCache}
                    variant="outline"
                    className="w-full"
                    style={{ borderColor: borderColor, color: textPrimary }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Cache
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Account Section */}
          {activeSection === 'account' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4"
            >
              <div className="px-0">
                {/* Account Statistics */}
                <div className="px-6 py-4">
                  <p className="text-sm font-medium mb-4" style={{ color: textPrimary }}>Account Statistics</p>
                  <div className="space-y-3">
                    {[
                      { icon: Calendar, label: 'Joined', value: accountStats.joinedDate },
                      { icon: MessageSquare, label: 'Messages', value: accountStats.totalMessages.toLocaleString() },
                      { icon: Users, label: 'Contacts', value: accountStats.totalContacts.toLocaleString() },
                      { icon: Users, label: 'Groups', value: accountStats.totalGroups.toLocaleString() },
                      { icon: Camera, label: 'Media Files', value: accountStats.totalMedia.toLocaleString() }
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <Icon className="w-4 h-4" style={{ color: accentColor }} />
                        <span className="text-sm" style={{ color: textSecondary }}>{label}:</span>
                        <span className="text-sm font-medium" style={{ color: textPrimary }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account Actions */}
                <div className="px-6 py-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                  <p className="text-sm font-medium mb-4" style={{ color: textPrimary }}>Account Actions</p>
                  <div className="space-y-3">
                    <Button
                      onClick={handleExportData}
                      variant="outline"
                      className="w-full"
                      style={{ borderColor: borderColor, color: textPrimary }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button
                      onClick={() => setShowLogoutConfirm(true)}
                      variant="outline"
                      className="w-full"
                      style={{ borderColor: '#dc2626', color: '#dc2626' }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </Button>
                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="outline"
                      className="w-full"
                      style={{ borderColor: '#dc2626', color: '#dc2626' }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Info Section */}
          <div className="px-6 py-6 text-center">
            <p className="text-xs" style={{ color: textSecondary }}>
              {activeSection === 'profile' ? 'Tap on any field to edit. Changes are saved automatically.' :
               'Settings are saved automatically.'}
            </p>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && tempImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80"
            onClick={cancelImageUpload}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-xl p-6 max-w-md w-full shadow-xl"
            style={{ background: headerBg, border: `1px solid ${borderColor}` }}
          >
            <h3 className="text-lg font-semibold mb-4 text-center" style={{ color: textPrimary }}>
              Profile Photo Preview
            </h3>
            
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Avatar className="w-40 h-40 ring-4 ring-offset-4" style={{ 
                  '--tw-ring-color': borderColor, 
                  '--tw-ring-offset-color': bgColor 
                } as React.CSSProperties}>
                  <AvatarImage src={tempImage} />
                  <AvatarFallback className="text-3xl font-light" style={{ 
                    background: accentColor, 
                    color: textPrimary 
                  }}>
                    {currentUser ? getInitials(currentUser.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: accentColor }}>
                  <Check className="w-4 h-4" style={{ color: textPrimary }} />
                </div>
              </div>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-sm" style={{ color: textPrimary }}>
                This will be your new profile photo
              </p>
              <p className="text-xs mt-1" style={{ color: textSecondary }}>
                Make sure it looks good before confirming
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={cancelImageUpload}
                variant="outline"
                className="flex-1"
                style={{ borderColor: borderColor, color: textPrimary }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={confirmImageUpload}
                disabled={loading}
                className="flex-1"
                style={{ background: accentColor, color: textPrimary }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirm
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-xl p-5 max-w-sm w-full shadow-xl"
            style={{ background: headerBg, border: `1px solid ${borderColor}` }}
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: textPrimary }}>
              Log Out?
            </h3>
            <p className="text-sm mb-5" style={{ color: textSecondary }}>
              Are you sure you want to log out of LoyalChat?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowLogoutConfirm(false)}
                variant="outline"
                className="flex-1"
                style={{ borderColor: borderColor, color: textPrimary }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogout}
                className="flex-1"
                style={{ background: '#dc2626', color: textPrimary }}
              >
                Log Out
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-xl p-5 max-w-sm w-full shadow-xl"
            style={{ background: headerBg, border: `1px solid ${borderColor}` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#dc2626' }}>
                <AlertCircle className="w-5 h-5" style={{ color: textPrimary }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: textPrimary }}>Delete Account?</h3>
                <p className="text-sm" style={{ color: textSecondary }}>This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm mb-5" style={{ color: textSecondary }}>
              All your data, messages, and media will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1"
                style={{ borderColor: borderColor, color: textPrimary }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="flex-1"
                style={{ background: '#dc2626', color: textPrimary }}
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
