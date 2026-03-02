'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Video, Phone, MoreVertical, Smile, Paperclip, Mic, Send,
  User, Ban, Sun, Image as ImageIcon, Star, Download, Trash2, X,
  Check, CheckCheck, AlertCircle
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Message {
  id: string
  text: string
  time: string
  isOwn: boolean
  status?: 'sent' | 'delivered' | 'read'
}

interface ChatTheme {
  id: string
  name: string
  gradient: string
}

const themes: ChatTheme[] = [
  { id: 'purple', name: 'Purple Gradient', gradient: 'from-purple-600 to-blue-500' },
  { id: 'ocean', name: 'Ocean Blue', gradient: 'from-cyan-500 to-blue-500' },
  { id: 'sunset', name: 'Sunset', gradient: 'from-orange-500 to-pink-500' },
  { id: 'forest', name: 'Forest', gradient: 'from-green-500 to-teal-500' },
  { id: 'cotton', name: 'Cotton Candy', gradient: 'from-pink-500 to-violet-500' },
  { id: 'dark', name: 'Dark Mode', gradient: 'from-gray-600 to-gray-800' },
]

const sampleMessages: Message[] = [
  { id: '1', text: "Hey! How are you doing? 👋", time: '10:30 AM', isOwn: false },
  { id: '2', text: "I'm doing great, thanks for asking! How about you?", time: '10:32 AM', isOwn: true, status: 'read' },
  { id: '3', text: "I'm good too! Just finished a project I've been working on for weeks. Feels great to finally complete it! 🎉", time: '10:35 AM', isOwn: false },
  { id: '4', text: "That's awesome! Congratulations! 🎊 What kind of project was it?", time: '10:36 AM', isOwn: true, status: 'read' },
  { id: '5', text: "It was a mobile app for tracking fitness goals. Took me about 3 months to build!", time: '9:15 AM', isOwn: false },
  { id: '6', text: "Wow, that sounds really interesting! Is it available on the app store?", time: '9:20 AM', isOwn: true, status: 'read' },
  { id: '7', text: "Not yet, still doing some final testing. Should be up by next week! I'll send you the link when it's live.", time: '9:25 AM', isOwn: false },
  { id: '8', text: "Perfect! Can't wait to try it out 💪", time: '9:28 AM', isOwn: true, status: 'read' },
]

export default function WhatsAppChat() {
  const [showMenu, setShowMenu] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState('purple')
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState(sampleMessages)

  const currentTheme = themes.find(t => t.id === selectedTheme) || themes[0]

  const handleSendMessage = () => {
    if (!messageInput.trim()) return
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      status: 'sent'
    }
    
    setMessages([...messages, newMessage])
    setMessageInput('')
  }

  const menuItems = [
    { icon: User, label: 'Contact info', action: () => setActiveModal('contact') },
    { icon: Ban, label: 'Block', action: () => setActiveModal('block'), danger: true },
    { icon: Sun, label: 'Chat theme', action: () => setActiveModal('theme') },
    { icon: ImageIcon, label: 'Wallpaper', action: () => setActiveModal('wallpaper') },
    { icon: Star, label: 'Add to favorites', action: () => {} },
    { icon: Download, label: 'Export chat', action: () => setActiveModal('export') },
    { icon: Trash2, label: 'Delete chat', action: () => setActiveModal('delete'), danger: true },
  ]

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="w-full max-w-md h-screen flex flex-col relative">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(120, 0, 255, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(0, 100, 255, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(100, 50, 200, 0.05) 0%, transparent 40%)
            `
          }}
        />

        {/* Header */}
        <header className="relative z-20 bg-[#1a1a1a] px-3 py-2.5 flex items-center gap-2 border-b border-white/5">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <Avatar className="w-10 h-10 ring-2 ring-purple-500/30">
              <AvatarFallback className={`bg-gradient-to-br ${currentTheme.gradient} text-white font-medium`}>
                JD
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1a1a]" />
          </div>

          <div className="flex-1 min-w-0 ml-1">
            <h2 className="font-semibold text-white truncate text-base">John Doe</h2>
            <span className="text-sm text-green-400">online</span>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
              <Phone className="w-5 h-5" />
            </button>
            <button 
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 relative"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full right-3 mt-1 bg-[#2a2a2a] rounded-xl shadow-xl overflow-hidden z-50 min-w-[180px]"
              >
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors ${
                      item.danger ? 'text-red-500' : 'text-white'
                    }`}
                    onClick={() => {
                      setShowMenu(false)
                      item.action()
                    }}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 relative z-10">
          {/* Date Separator */}
          <div className="flex justify-center mb-6">
            <span className="px-4 py-1.5 bg-white/5 rounded-full text-xs text-gray-400 uppercase tracking-wider font-medium">
              Today
            </span>
          </div>

          {/* Messages */}
          <div className="space-y-2">
            {messages.map((msg, index) => {
              const prevMsg = messages[index - 1]
              const nextMsg = messages[index + 1]
              const isFirst = !prevMsg || prevMsg.isOwn !== msg.isOwn
              const isLast = !nextMsg || nextMsg.isOwn !== msg.isOwn

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${msg.isOwn ? 'ml-12' : 'mr-12'}`}>
                    <div
                      className={`relative px-4 py-2.5 ${
                        msg.isOwn
                          ? `bg-gradient-to-br ${currentTheme.gradient} text-white`
                          : 'bg-[#2a2a2a] text-white'
                      } ${
                        msg.isOwn
                          ? `${isFirst ? 'rounded-tl-2xl' : 'rounded-tl-lg'} ${isLast ? 'rounded-bl-2xl' : 'rounded-bl-lg'} rounded-tr-2xl rounded-br-2xl`
                          : `${isFirst ? 'rounded-tr-2xl' : 'rounded-tr-lg'} ${isLast ? 'rounded-br-2xl' : 'rounded-br-lg'} rounded-tl-2xl rounded-bl-2xl`
                      }`}
                    >
                      <p className="text-[15px] leading-[20px] break-words whitespace-pre-wrap">{msg.text}</p>
                      
                      <div className={`flex items-center justify-end gap-1.5 mt-1 ${msg.isOwn ? 'text-white/60' : 'text-gray-500'}`}>
                        <span className="text-[11px]">{msg.time}</span>
                        {msg.isOwn && msg.status && (
                          <span className="flex items-center">
                            {msg.status === 'read' ? (
                              <CheckCheck className="w-4 h-4 text-sky-300" />
                            ) : msg.status === 'delivered' ? (
                              <CheckCheck className="w-4 h-4" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative z-20 bg-[#1a1a1a] px-3 py-2.5 border-t border-white/5">
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors">
              <Smile className="w-6 h-6" />
            </button>

            <div className="flex-1">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Message"
                className="h-11 bg-[#2a2a2a] border-0 rounded-full px-5 text-white placeholder:text-gray-500 focus:ring-1 focus:ring-purple-500/50"
              />
            </div>

            <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>

            {messageInput.trim() ? (
              <Button
                onClick={handleSendMessage}
                size="icon"
                className={`w-11 h-11 rounded-full bg-gradient-to-r ${currentTheme.gradient} shadow-lg`}
              >
                <Send className="w-5 h-5 text-white" />
              </Button>
            ) : (
              <button className={`p-2.5 bg-gradient-to-r ${currentTheme.gradient} rounded-full shadow-lg`}>
                <Mic className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Overlay */}
        <AnimatePresence>
          {activeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              {/* Contact Info Modal */}
              {activeModal === 'contact' && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-[#1f1f1f] rounded-2xl w-full max-w-sm overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 text-center border-b border-white/10">
                    <Avatar className={`w-20 h-20 mx-auto mb-3 ring-4 ring-white/10`}>
                      <AvatarFallback className={`bg-gradient-to-br ${currentTheme.gradient} text-white text-2xl font-semibold`}>
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold text-white">John Doe</h3>
                    <p className="text-gray-400 text-sm mt-1">+1 234 567 8900</p>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="bg-[#2a2a2a] rounded-xl p-4">
                      <p className="text-xs text-purple-400 uppercase tracking-wider mb-2">About</p>
                      <p className="text-white text-sm">Available</p>
                    </div>

                    <div className="bg-[#2a2a2a] rounded-xl p-4">
                      <p className="text-xs text-purple-400 uppercase tracking-wider mb-2">Media, links and docs</p>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="aspect-square bg-[#1a1a1a] rounded-lg" />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button className="w-full flex items-center gap-3 p-3 bg-[#2a2a2a] rounded-xl hover:bg-[#333] transition-colors">
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                        <span className="text-white text-sm">Report contact</span>
                      </button>
                      <button className="w-full flex items-center gap-3 p-3 bg-[#2a2a2a] rounded-xl hover:bg-[#333] transition-colors">
                        <Ban className="w-5 h-5 text-red-500" />
                        <span className="text-red-500 text-sm">Block contact</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Block Modal */}
              {activeModal === 'block' && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-[#1f1f1f] rounded-2xl w-full max-w-sm overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ban className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Block Contact?</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Blocked contacts will no longer be able to call you or send you messages.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                        onClick={() => setActiveModal(null)}
                      >
                        Cancel
                      </Button>
                      <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                        Block
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Theme Modal */}
              {activeModal === 'theme' && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-[#1f1f1f] rounded-2xl w-full max-w-sm overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white">Chat Theme</h3>
                    <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-sm text-gray-400 mb-4">Choose a theme</p>
                    <div className="grid grid-cols-3 gap-3">
                      {themes.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setSelectedTheme(theme.id)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                            selectedTheme === theme.id 
                              ? 'bg-purple-500/20 ring-2 ring-purple-500' 
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient}`} />
                          <span className="text-xs text-gray-400">{theme.name}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                        onClick={() => setActiveModal(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className={`flex-1 bg-gradient-to-r ${currentTheme.gradient} text-white`}
                        onClick={() => setActiveModal(null)}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Wallpaper Modal */}
              {activeModal === 'wallpaper' && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-[#1f1f1f] rounded-2xl w-full max-w-sm overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white">Chat Wallpaper</h3>
                    <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      {['Default', 'Dots', 'Lines', 'Gradient'].map((name, i) => (
                        <button key={name} className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
                          <div className={`w-full aspect-[9/16] rounded-xl bg-[#0e0e0e] ${
                            i === 1 ? 'bg-[radial-gradient(circle,rgba(168,85,247,0.15)_1px,transparent_1px)] bg-[length:20px_20px]' :
                            i === 2 ? 'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(168,85,247,0.05)_10px,rgba(168,85,247,0.05)_20px)]' :
                            i === 3 ? 'bg-gradient-to-b from-[#0e0e0e] via-[#1a1a2e] to-[#0e0e0e]' : ''
                          }`} />
                          <span className="text-xs text-gray-400">{name}</span>
                        </button>
                      ))}
                    </div>
                    
                    <Button
                      className={`w-full mt-4 bg-gradient-to-r ${currentTheme.gradient} text-white`}
                      onClick={() => setActiveModal(null)}
                    >
                      Set Wallpaper
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Export Modal */}
              {activeModal === 'export' && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-[#1f1f1f] rounded-2xl w-full max-w-sm overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Download className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Export Chat?</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      The chat will be exported as a .txt file
                    </p>
                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-6">
                      <input type="checkbox" defaultChecked className="accent-purple-500" />
                      Include media files
                    </label>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                        onClick={() => setActiveModal(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className={`flex-1 bg-gradient-to-r ${currentTheme.gradient} text-white`}
                      >
                        Export
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Delete Modal */}
              {activeModal === 'delete' && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-[#1f1f1f] rounded-2xl w-full max-w-sm overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trash2 className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Delete this chat?</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Messages will only be removed from your device. This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                        onClick={() => setActiveModal(null)}
                      >
                        Cancel
                      </Button>
                      <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
