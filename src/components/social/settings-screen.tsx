'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Bell, Lock, Palette, HelpCircle, Info, LogOut,
  Moon, Sun, Shield, Globe, MessageCircle, ChevronRight, ArrowLeft,
  Settings as SettingsIcon, Check, Wifi, Database, X,
  Smartphone, Star, FileText, Phone, Volume2, Vibrate, Mail, AlertCircle,
  Camera
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useChatStore } from '@/store/chat-store'

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingId =
  | 'profile' | 'privacy' | 'notifications' | 'security'
  | 'appearance' | 'language' | 'chat' | 'storage'
  | 'help' | 'about' | 'rate'

interface SettingItem {
  id: SettingId
  icon: typeof User
  iconBg: string
  iconColor: string
  label: string
  description?: string
  toggle?: boolean
  value?: string
}

interface SettingsState {
  language: string
  notificationSound: boolean
  notificationVibration: boolean
  notificationPreview: boolean
  privacyLastSeen: 'everyone' | 'contacts' | 'nobody'
  privacyProfilePic: 'everyone' | 'contacts' | 'nobody'
  privacyReadReceipts: boolean
  privacyGroupInvites: 'everyone' | 'contacts' | 'nobody'
  securityTwoFactor: boolean
  securityFingerprint: boolean
  chatWallpaper: 'default' | 'custom'
  chatFontSize: 'small' | 'medium' | 'large'
  chatHistoryAutoDelete: boolean
  storageAutoDownload: boolean
  storageQuality: 'high' | 'medium' | 'low'
}

// ─── Settings definition ─────────────────────────────────────────────────────

const sections: { title: string; items: SettingItem[] }[] = [
  {
    title: 'Account',
    items: [
      { id: 'profile', icon: User, iconBg: 'bg-blue-500', iconColor: 'text-white', label: 'Account', description: 'Manage your profile and account info' },
      { id: 'privacy', icon: Shield, iconBg: 'bg-teal-500', iconColor: 'text-white', label: 'Privacy', description: 'Block contacts, disappearing messages' },
      { id: 'security', icon: Lock, iconBg: 'bg-green-600', iconColor: 'text-white', label: 'Security', description: 'Two-step verification, fingerprint' },
      { id: 'notifications', icon: Bell, iconBg: 'bg-red-500', iconColor: 'text-white', label: 'Notifications', description: 'Message, group & call tones' },
    ],
  },
  {
    title: 'General',
    items: [
      { id: 'chat', icon: MessageCircle, iconBg: 'bg-green-500', iconColor: 'text-white', label: 'Chats', description: 'Theme, wallpaper, chat history' },
      { id: 'storage', icon: Database, iconBg: 'bg-orange-500', iconColor: 'text-white', label: 'Storage and data', description: 'Network usage, auto-download' },
      { id: 'appearance', icon: Palette, iconBg: 'bg-purple-500', iconColor: 'text-white', label: 'Appearance', description: 'Theme & display', toggle: true },
      { id: 'language', icon: Globe, iconBg: 'bg-indigo-500', iconColor: 'text-white', label: 'App language', value: 'English (US)' },
    ],
  },
  {
    title: 'Help',
    items: [
      { id: 'help', icon: HelpCircle, iconBg: 'bg-cyan-500', iconColor: 'text-white', label: 'Help', description: 'FAQ, contact us, privacy policy' },
      { id: 'about', icon: Info, iconBg: 'bg-slate-500', iconColor: 'text-white', label: 'App info', description: 'LoyaChat · Version 2.0.0' },
      { id: 'rate', icon: Star, iconBg: 'bg-amber-500', iconColor: 'text-white', label: 'Rate LoyaChat', description: 'Share your feedback' },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// ─── Mobile Detail Panel ────────────────────────────────────────────────────

interface DetailPanelMobileProps {
  id: SettingId
  settings: SettingsState
  updateSetting: (key: keyof SettingsState, value: any) => void
  theme: string | undefined
  setTheme: (t: string) => void
  currentUser?: any
}

function DetailPanelMobile({ id, settings, updateSetting, theme, setTheme, currentUser }: DetailPanelMobileProps) {
  const { setCurrentUser, textSize, setTextSize } = useChatStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64Image = ev.target?.result as string
      if (!base64Image) {
        setIsUploading(false)
        return
      }

      try {
        const response = await fetch(`/api/users/${currentUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64Image }),
        })

        if (response.ok) {
          const data = await response.json()
          setCurrentUser(data.user)
        } else {
          console.error('Failed to update avatar')
        }
      } catch (error) {
        console.error('Error updating avatar:', error)
      } finally {
        setIsUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const renderContent = () => {
    switch (id) {
      case 'notifications':
        return (
          <div className="px-4 space-y-4">
            <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <p className="text-[15px] font-medium text-gray-900 dark:text-white">Sound</p>
                    <p className="text-xs text-gray-400 dark:text-[#8e8e93] mt-0.5">Notification sound</p>
                  </div>
                </div>
                <Switch checked={settings.notificationSound} onCheckedChange={v => updateSetting('notificationSound', v)} />
              </div>
            </div>

            <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Vibrate className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <p className="text-[15px] font-medium text-gray-900 dark:text-white">Vibration</p>
                    <p className="text-xs text-gray-400 dark:text-[#8e8e93] mt-0.5">Haptic feedback</p>
                  </div>
                </div>
                <Switch checked={settings.notificationVibration} onCheckedChange={v => updateSetting('notificationVibration', v)} />
              </div>
            </div>

            <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <p className="text-[15px] font-medium text-gray-900 dark:text-white">Message Preview</p>
                    <p className="text-xs text-gray-400 dark:text-[#8e8e93] mt-0.5">Show message content</p>
                  </div>
                </div>
                <Switch checked={settings.notificationPreview} onCheckedChange={v => updateSetting('notificationPreview', v)} />
              </div>
            </div>
          </div>
        )

      case 'privacy':
        return (
          <div className="px-4 space-y-4">
            {[
              { label: 'Last Seen', key: 'privacyLastSeen' as const },
              { label: 'Profile Picture', key: 'privacyProfilePic' as const },
              { label: 'Group Invites', key: 'privacyGroupInvites' as const },
            ].map(item => (
              <div key={item.key} className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-4">
                <p className="text-[15px] font-medium text-gray-900 dark:text-white mb-3">{item.label}</p>
                <div className="space-y-2">
                  {(['everyone', 'contacts', 'nobody'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => updateSetting(item.key, opt)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors',
                        settings[item.key] === opt
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                          : 'border-gray-200 dark:border-[#3a3a3c] hover:bg-gray-50 dark:hover:bg-[#3a3a3c]'
                      )}
                    >
                      {settings[item.key] === opt && <Check className="w-4 h-4 text-teal-600" />}
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-medium text-gray-900 dark:text-white">Read Receipts</p>
                <Switch checked={settings.privacyReadReceipts} onCheckedChange={v => updateSetting('privacyReadReceipts', v)} />
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="px-4 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-2xl p-3">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-600 dark:text-blue-400">Keep your account secure with two-factor authentication</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-400 dark:text-[#8e8e93] mt-0.5">Extra security layer</p>
                </div>
                <Switch checked={settings.securityTwoFactor} onCheckedChange={v => updateSetting('securityTwoFactor', v)} />
              </div>
            </div>

            <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-medium text-gray-900 dark:text-white">Fingerprint Lock</p>
                  <p className="text-xs text-gray-400 dark:text-[#8e8e93] mt-0.5">Biometric authentication</p>
                </div>
                <Switch checked={settings.securityFingerprint} onCheckedChange={v => updateSetting('securityFingerprint', v)} />
              </div>
            </div>
          </div>
        )

      case 'language':
        return (
          <div className="px-4 space-y-4">
            {['English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Portuguese'].map(lang => (
              <button
                key={lang}
                onClick={() => updateSetting('language', lang)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-colors',
                  settings.language === lang
                    ? 'bg-white dark:bg-[#2c2c2e] border-teal-500'
                    : 'bg-white dark:bg-[#2c2c2e] border-gray-200 dark:border-[#3a3a3c]'
                )}
              >
                <span className="text-[15px] font-medium text-gray-900 dark:text-white">{lang}</span>
                {settings.language === lang && <Check className="w-5 h-5 text-teal-600" />}
              </button>
            ))}
          </div>
        )

      case 'chat':
        return (
          <div className="px-4 space-y-4">
            <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-4">
              <p className="text-[15px] font-medium text-gray-900 dark:text-white mb-3">Font Size</p>
              <div className="space-y-2">
                {(['small', 'medium', 'large'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => {
                      updateSetting('chatFontSize', size)
                      setTextSize(size)
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors',
                      textSize === size
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-gray-200 dark:border-[#3a3a3c]'
                    )}
                  >
                    {textSize === size && <Check className="w-4 h-4 text-teal-600" />}
                    <span className={cn('font-medium text-gray-900 dark:text-white capitalize', size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base')}>{size}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-medium text-gray-900 dark:text-white">Auto-Delete Messages</p>
                <Switch checked={settings.chatHistoryAutoDelete} onCheckedChange={v => updateSetting('chatHistoryAutoDelete', v)} />
              </div>
            </div>
          </div>
        )

      case 'storage':
        return (
          <div className="px-4 space-y-4">
            <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[15px] font-medium text-gray-900 dark:text-white">Auto-Download</p>
                <Switch checked={settings.storageAutoDownload} onCheckedChange={v => updateSetting('storageAutoDownload', v)} />
              </div>
            </div>

            <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-4">
              <p className="text-[15px] font-medium text-gray-900 dark:text-white mb-3">Media Quality</p>
              <div className="space-y-2">
                {(['high', 'medium', 'low'] as const).map(quality => (
                  <button
                    key={quality}
                    onClick={() => updateSetting('storageQuality', quality)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors',
                      settings.storageQuality === quality
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-gray-200 dark:border-[#3a3a3c]'
                    )}
                  >
                    {settings.storageQuality === quality && <Check className="w-4 h-4 text-teal-600" />}
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{quality} Quality</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'appearance':
        return (
          <div className="px-4 space-y-4">
            <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="w-5 h-5 text-gray-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  <div>
                    <p className="text-[15px] font-medium text-gray-900 dark:text-white">Dark Mode</p>
                    <p className="text-xs text-gray-400 dark:text-[#8e8e93] mt-0.5">Switch theme</p>
                  </div>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={c => setTheme(c ? 'dark' : 'light')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(['light', 'dark'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    'relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
                    theme === t ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20' : 'border-gray-200 dark:border-[#3a3a3c]'
                  )}
                >
                  <div className={cn('w-full h-16 rounded-lg', t === 'dark' ? 'bg-slate-900' : 'bg-gray-50 border border-gray-200')} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{t}</span>
                  {theme === t && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )

      case 'help':
        return (
          <div className="px-4 space-y-4">
            {[
              { title: 'FAQ', desc: 'Frequently asked questions' },
              { title: 'Contact Support', desc: 'Get help from our team' },
              { title: 'Report Bug', desc: 'Help us fix issues' },
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-white dark:bg-[#2c2c2e] border border-gray-200 dark:border-[#3a3a3c] hover:bg-gray-50 dark:hover:bg-[#3a3a3c] transition-colors">
                <div className="text-left">
                  <p className="text-[15px] font-medium text-gray-900 dark:text-white">{item.title}</p>
                  <p className="text-xs text-gray-400 dark:text-[#8e8e93] mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-[#636366]" />
              </button>
            ))}
          </div>
        )

      case 'about':
        return (
          <div className="px-4 space-y-4">
            <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-6 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-teal-600" />
              <p className="text-lg font-semibold text-gray-900 dark:text-white">LoyaChat</p>
              <p className="text-2xl font-bold text-teal-600 mt-1">v2.0.0</p>
              <p className="text-xs text-gray-400 dark:text-[#8e8e93] mt-3">A modern social chat platform</p>
            </div>

            <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-4 space-y-3">
              {[
                { label: 'Build', value: '2024.03.02' },
                { label: 'Platform', value: 'Web · iOS · Android' },
                { label: 'License', value: 'GNU v3' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-[#3a3a3c] last:border-0 last:pb-0">
                  <span className="text-sm text-gray-600 dark:text-[#8e8e93]">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )

      case 'rate':
        return (
          <div className="px-4 space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <p className="text-[15px] font-medium text-gray-900 dark:text-white">Love LoyaChat?</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Leave us a 5-star rating!</p>
            </div>

            <button className="w-full py-3 px-4 rounded-2xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors">
              Rate on App Store
            </button>

            <button className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-[#2c2c2e] border border-gray-200 dark:border-[#3a3a3c] text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-[#3a3a3c] transition-colors">
              Share Feedback
            </button>
          </div>
        )

      case 'profile':
      default:
        return (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="w-24 h-24 ring-4 ring-teal-500/20">
                  <AvatarImage src={currentUser?.avatar || undefined} />
                  <AvatarFallback className="bg-teal-600 text-white text-3xl font-bold">
                    {currentUser ? getInitials(currentUser.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={cn(
                    "absolute bottom-0 right-0 p-2 bg-white dark:bg-[#323234] rounded-full shadow-lg border border-gray-100 dark:border-[#3a3a3c] transition-opacity",
                    isUploading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Camera className={cn("w-4 h-4 text-teal-600", isUploading && "animate-pulse")} />
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentUser?.name || 'User'}</h2>
              <p className="text-teal-600 dark:text-teal-400 font-medium text-sm">@{currentUser?.username || 'username'}</p>
            </div>

            <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-[#3a3a3c]">
              {[
                { icon: User, label: 'Name', value: currentUser?.name || 'User' },
                { icon: Mail, label: 'Email', value: currentUser?.email || 'Not set' },
                { icon: Phone, label: 'Phone', value: currentUser?.phone || 'Not set' },
                { icon: Info, label: 'Bio', value: currentUser?.bio || 'Available' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#323234] flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-[15px] font-medium text-gray-900 dark:text-white mt-0.5">{item.value}</p>
                  </div>
                  <button className="text-teal-600 text-sm font-medium">Edit</button>
                </div>
              ))}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="space-y-4">
        {renderContent()}
      </div>
    </div>
  )
}

// ─── Android Mobile Settings ─────────────────────────────────────────────────

function AndroidSettings() {
  const { currentUser, logout } = useChatStore()
  const { theme, setTheme } = useTheme()
  const [activePanel, setActivePanel] = useState<SettingId | null>(null)
  const [settings, setSettings] = useState<SettingsState>({
    language: 'English (US)',
    notificationSound: true,
    notificationVibration: true,
    notificationPreview: true,
    privacyLastSeen: 'everyone',
    privacyProfilePic: 'contacts',
    privacyReadReceipts: true,
    privacyGroupInvites: 'contacts',
    securityTwoFactor: false,
    securityFingerprint: false,
    chatWallpaper: 'default',
    chatFontSize: 'medium',
    chatHistoryAutoDelete: false,
    storageAutoDownload: true,
    storageQuality: 'high',
  })

  const updateSetting = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] dark:bg-[#1c1c1e]">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#2c2c2e] border-b border-gray-200 dark:border-[#3a3a3c] px-4 py-3 sticky top-0 z-20 flex items-center justify-between">
        {activePanel ? (
          <>
            <button onClick={() => setActivePanel(null)} className="p-1">
              <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex-1 text-center">
              {sections.flatMap(s => s.items).find(i => i.id === activePanel)?.label}
            </h1>
            <div className="w-7" />
          </>
        ) : (
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!activePanel ? (
          <motion.div key="main" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pb-8">
            {/* ── Profile card ───────────────────────────────────────────────── */}
            <div className="mx-4 mt-4 mb-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#2c2c2e] rounded-2xl overflow-hidden"
              >
                <button className="w-full flex items-center gap-4 px-4 py-4 active:bg-gray-50 dark:active:bg-[#3a3a3c] transition-colors">
                  <div className="relative">
                    <Avatar className="w-16 h-16 ring-2 ring-gray-100 dark:ring-[#3a3a3c]">
                      <AvatarImage src={currentUser?.avatar || undefined} />
                      <AvatarFallback className="bg-teal-600 text-white text-xl font-bold">
                        {currentUser ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-[#2c2c2e]" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[17px] font-semibold text-gray-900 dark:text-white leading-tight">
                      {currentUser?.name || 'User'}
                    </p>
                    <p className="text-sm text-teal-600 dark:text-teal-400 mt-0.5">
                      {currentUser?.bio || 'Available'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-[#8e8e93] mt-0.5">
                      {currentUser?.phone || currentUser?.email || ''}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 dark:text-[#636366] shrink-0" />
                </button>
              </motion.div>
            </div>

            {/* ── Sections ───────────────────────────────────────────────────── */}
            <div className="space-y-0 px-4">
              {sections.map((section, sIdx) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (sIdx + 1) * 0.06 }}
                  className="mt-6"
                >
                  <p className="text-[13px] font-semibold text-gray-500 dark:text-[#8e8e93] uppercase tracking-wide px-1 mb-1">
                    {section.title}
                  </p>

                  <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl overflow-hidden">
                    {section.items.map((item, iIdx) => {
                      const Icon = item.icon
                      const isLast = iIdx === section.items.length - 1

                      return (
                        <div key={item.id}>
                          {item.toggle ? (
                            <div className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors">
                              <div className={cn('w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0', item.iconBg)}>
                                <Icon className={cn('w-[18px] h-[18px]', item.iconColor)} />
                              </div>

                              <div className="flex-1 text-left min-w-0">
                                <p className="text-[15px] text-gray-900 dark:text-white font-normal leading-snug">
                                  {item.label}
                                </p>
                                {item.description && (
                                  <p className="text-xs text-gray-400 dark:text-[#8e8e93] mt-0.5 truncate">
                                    {item.description}
                                  </p>
                                )}
                                {item.value && (
                                  <p className="text-xs text-gray-400 dark:text-[#8e8e93] mt-0.5">{item.value}</p>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {theme === 'dark'
                                  ? <Moon className="w-4 h-4 text-gray-400" />
                                  : <Sun className="w-4 h-4 text-amber-500" />
                                }
                                <Switch
                                  checked={theme === 'dark'}
                                  onCheckedChange={c => setTheme(c ? 'dark' : 'light')}
                                />
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setActivePanel(item.id)}
                              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 dark:active:bg-[#3a3a3c] transition-colors"
                            >
                              <div className={cn('w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0', item.iconBg)}>
                                <Icon className={cn('w-[18px] h-[18px]', item.iconColor)} />
                              </div>

                              <div className="flex-1 text-left min-w-0">
                                <p className="text-[15px] text-gray-900 dark:text-white font-normal leading-snug">
                                  {item.label}
                                </p>
                                {item.description && (
                                  <p className="text-xs text-gray-400 dark:text-[#8e8e93] mt-0.5 truncate">
                                    {item.description}
                                  </p>
                                )}
                                {item.value && (
                                  <p className="text-xs text-gray-400 dark:text-[#8e8e93] mt-0.5">{item.value}</p>
                                )}
                              </div>

                              <ChevronRight className="w-4 h-4 text-gray-300 dark:text-[#636366] shrink-0" />
                            </button>
                          )}

                          {!isLast && (
                            <div className="ml-[52px] mr-0 h-px bg-gray-100 dark:bg-[#3a3a3c]" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              ))}

              {/* ── Sign out ────────────────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="mt-8"
              >
                <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl overflow-hidden">
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-4 active:bg-red-50 dark:active:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span className="text-[15px] font-medium text-red-500">Sign out</span>
                  </button>
                </div>
              </motion.div>

              {/* ── Footer ──────────────────────────────────────────────────── */}
              <div className="mt-8 pb-8 flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-gray-400 dark:text-[#636366]">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="text-xs">LoyaChat</span>
                </div>
                <p className="text-[11px] text-gray-300 dark:text-[#48484a]">Version 2.0.0</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pb-8">
            <DetailPanelMobile id={activePanel} settings={settings} updateSetting={updateSetting} theme={theme} setTheme={setTheme} currentUser={currentUser} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Desktop Detail Panel ──────────────────────────────────────────────────

type SettingId2 = NonNullable<typeof sections[number]['items'][number]['id']>

interface DetailPanelProps {
  id: SettingId2
  theme: string | undefined
  setTheme: (t: string) => void
  currentUser?: any
}

function DetailPanel({ id, theme, setTheme, currentUser }: DetailPanelProps) {
  const { setCurrentUser, textSize, setTextSize } = useChatStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64Image = ev.target?.result as string
      if (!base64Image) {
        setIsUploading(false)
        return
      }

      try {
        const response = await fetch(`/api/users/${currentUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64Image }),
        })

        if (response.ok) {
          const data = await response.json()
          setCurrentUser(data.user)
        } else {
          console.error('Failed to update avatar')
        }
      } catch (error) {
        console.error('Error updating avatar:', error)
      } finally {
        setIsUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const allItems = sections.flatMap(s => s.items)
  const item = allItems.find(i => i.id === id)
  if (!item) return null
  const Icon = item.icon

  const renderContent = () => {
    switch (id) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 px-5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-gray-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Switch between light and dark</p>
                </div>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={c => setTheme(c ? 'dark' : 'light')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['light', 'dark'] as const).map(t => (
                <button key={t} onClick={() => setTheme(t)} className={cn(
                  'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                  theme === t ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'
                )}>
                  <div className={cn('w-full h-14 rounded-lg', t === 'dark' ? 'bg-slate-900' : 'bg-gray-50 border border-gray-200')} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{t}</span>
                  {theme === t && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )
      case 'notifications':
        return (
          <div className="space-y-3">
            {[
              { icon: Volume2, label: 'Sound', desc: 'Notification sound' },
              { icon: Vibrate, label: 'Vibration', desc: 'Haptic feedback' },
              { icon: Mail, label: 'Message Preview', desc: 'Show message content' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3.5 px-5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <Switch defaultChecked={true} />
              </div>
            ))}
          </div>
        )
      case 'privacy':
        return (
          <div className="space-y-6">
            {[
              { title: 'Last Seen', options: ['Everyone', 'Contacts', 'Nobody'] },
              { title: 'Profile Picture', options: ['Everyone', 'Contacts', 'Nobody'] },
              { title: 'Group Invites', options: ['Everyone', 'Contacts', 'Nobody'] },
            ].map((section, i) => (
              <div key={i}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{section.title}</h3>
                <div className="space-y-2">
                  {section.options.map(opt => (
                    <label key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors">
                      <input type="radio" name={section.title} defaultChecked={opt === 'Everyone'} className="w-4 h-4" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      case 'security':
        return (
          <div className="space-y-3">
            {[
              { label: 'Two-Factor Authentication', desc: 'Extra security for your account' },
              { label: 'Fingerprint Lock', desc: 'Biometric authentication' },
              { label: 'Session Management', desc: 'View active sessions' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3.5 px-5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <Switch defaultChecked={i === 2} />
              </div>
            ))}
          </div>
        )
      case 'language':
        return (
          <div className="space-y-2">
            {['English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Portuguese'].map(lang => (
              <label key={lang} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors">
                <input type="radio" name="language" defaultChecked={lang === 'English (US)'} className="w-4 h-4" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{lang}</span>
              </label>
            ))}
          </div>
        )
      case 'chat':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Font Size</h3>
              <div className="space-y-2">
                {(['small', 'medium', 'large'] as const).map(size => (
                  <label key={size} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors">
                    <input type="radio" name="fontSize" checked={textSize === size} onChange={() => setTextSize(size)} className="w-4 h-4" />
                    <span className={cn('font-medium text-gray-900 dark:text-white capitalize', size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base')}>{size}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-3.5 px-5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-Delete Messages</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Automatically delete old messages</p>
              </div>
              <Switch />
            </div>
          </div>
        )
      case 'storage':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between py-3.5 px-5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-Download</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Automatic media download</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Media Quality</h3>
              <div className="space-y-2">
                {['High', 'Medium', 'Low'].map(quality => (
                  <label key={quality} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors">
                    <input type="radio" name="quality" defaultChecked={quality === 'High'} className="w-4 h-4" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{quality} Quality</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )
      case 'help':
        return (
          <div className="space-y-3">
            {[
              { title: 'FAQ', desc: 'Frequently asked questions' },
              { title: 'Contact Support', desc: 'Get help from our team' },
              { title: 'Report Bug', desc: 'Help us fix issues' },
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-700 text-left hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
        )
      case 'about':
        return (
          <div className="space-y-6">
            <div className="text-center p-6 rounded-xl border border-gray-200 dark:border-slate-700 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-teal-600" />
              <p className="text-lg font-semibold text-gray-900 dark:text-white">LoyaChat</p>
              <p className="text-3xl font-bold text-teal-600 mt-1">v2.0.0</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">A modern social chat platform</p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Build', value: '2024.03.02' },
                { label: 'Platform', value: 'Web · iOS · Android' },
                { label: 'License', value: 'GNU v3' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                  <span className="text-sm text-gray-600 dark:text-[#8e8e93]">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )
      case 'rate':
        return (
          <div className="space-y-4">
            <div className="text-center p-6 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20">
              <Star className="w-12 h-12 mx-auto mb-3 text-amber-500" />
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Love LoyaChat?</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Leave us a 5-star rating!</p>
            </div>

            <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium hover:from-teal-700 hover:to-cyan-700 transition-all">
              Rate on App Store
            </button>

            <button className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors">
              Share Feedback
            </button>
          </div>
        )
      case 'profile':
      default:
        return (
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center py-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="relative group">
                <Avatar className="w-32 h-32 ring-4 ring-teal-500/20">
                  <AvatarImage src={currentUser?.avatar || undefined} />
                  <AvatarFallback className="bg-teal-600 text-white text-4xl font-bold">
                    {currentUser ? getInitials(currentUser.name) : 'U'}
                  </AvatarFallback>
                </Avatar>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={cn(
                    "absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                    isUploading && "opacity-100 flex"
                  )}
                >
                  <div className="bg-white dark:bg-[#323234] p-3 rounded-full shadow-lg">
                    <Camera className={cn("w-6 h-6 text-teal-600", isUploading && "animate-pulse")} />
                  </div>
                </button>
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{currentUser?.name || 'User'}</h3>
                <p className="text-teal-600 dark:text-teal-400 font-medium">@{currentUser?.username || 'username'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Name', value: currentUser?.name || 'User' },
                { label: 'Email', value: currentUser?.email || 'Not set' },
                { label: 'Phone', value: currentUser?.phone || 'Not set' },
                { label: 'Username', value: `@${currentUser?.username || 'username'}` },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">{item.label}</p>
                  <p className="text-[15px] font-medium text-gray-900 dark:text-white mt-1.5">{item.value}</p>
                </div>
              ))}
            </div>

            <button className="w-full mt-2 py-3.5 px-4 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all shadow-md shadow-teal-500/20">
              Edit Account Info
            </button>
          </div>
        )
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200 dark:border-slate-700">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.iconBg)}>
          <Icon className={cn('w-5 h-5', item.iconColor)} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{item.label}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{item.description || item.value}</p>
        </div>
      </div>

      {renderContent()}
    </div>
  )
}

function DesktopSettings() {
  const { currentUser, logout } = useChatStore()
  const { theme, setTheme } = useTheme()
  const [activeId, setActiveId] = useState<SettingId2>('profile')
  const allItems = sections.flatMap(s => s.items)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-5 h-5 text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-8">Manage your account, preferences, and privacy.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="flex gap-8 items-start">
          {/* Left nav */}
          <div className="w-56 shrink-0 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarImage src={currentUser?.avatar || undefined} />
                  <AvatarFallback className="bg-teal-600 text-white text-sm font-bold">
                    {currentUser ? getInitials(currentUser.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{currentUser?.name || 'User'}</p>
                  <p className="text-xs text-gray-400 truncate">@{currentUser?.username || 'username'}</p>
                </div>
              </div>
            </div>

            {sections.map(section => (
              <div key={section.title}>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5 px-2">{section.title}</p>
                <div className="space-y-0.5">
                  {section.items.map(item => {
                    const Icon = item.icon
                    const isActive = activeId === item.id
                    return (
                      <button key={item.id} onClick={() => setActiveId(item.id)}
                        className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                          isActive
                            ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-white'
                        )}>
                        <div className={cn('w-6 h-6 rounded-md flex items-center justify-center shrink-0', item.iconBg)}>
                          <Icon className={cn('w-3.5 h-3.5', item.iconColor)} />
                        </div>
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
              <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 min-h-[520px]">
            <DetailPanel id={activeId} theme={theme} setTheme={setTheme} currentUser={currentUser} />
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-600">
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>LoyaChat · Version 2.0.0</span>
          </div>
          <div className="flex items-center gap-4">
            {['Terms', 'Privacy', 'Help'].map(l => (
              <a key={l} href="#" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main export — responsive ─────────────────────────────────────────────────

export function SettingsScreen() {
  return (
    <>
      {/* Mobile: classic Android look */}
      <div className="md:hidden">
        <AndroidSettings />
      </div>
      {/* Desktop: two-panel */}
      <div className="hidden md:block">
        <DesktopSettings />
      </div>
    </>
  )
}
