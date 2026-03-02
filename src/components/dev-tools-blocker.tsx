'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, X } from 'lucide-react'

export function DevToolsBlocker() {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false)
  const [devToolsMethod, setDevToolsMethod] = useState<string | null>(null)

  useEffect(() => {
    let devToolsOpened = false

    // Method 1: Detect via window size differences (when dev tools is docked)
    const checkWindowSize = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160
      const heightThreshold = window.outerHeight - window.innerHeight > 160
      
      // Also check for undocked dev tools via console
      if ((widthThreshold || heightThreshold) && !devToolsOpened) {
        devToolsOpened = true
        setIsDevToolsOpen(true)
        setDevToolsMethod('Window size detection')
      }
    }

    // Method 2: Detect via debugger timing
    const checkDebugger = () => {
      const start = performance.now()
      // This will be slow if debugger is open
      debugger
      const end = performance.now()
      
      if (end - start > 100 && !devToolsOpened) {
        devToolsOpened = true
        setIsDevToolsOpen(true)
        setDevToolsMethod('Debugger detected')
      }
    }

    // Method 3: Detect via console.log override and element inspection
    const detectConsole = () => {
      const element = new Image()
      Object.defineProperty(element, 'id', {
        get: function() {
          if (!devToolsOpened) {
            devToolsOpened = true
            setIsDevToolsOpen(true)
            setDevToolsMethod('Console opened')
          }
          return 'devtools-detector'
        }
      })
      
      // This triggers when console logs the element
      try {
        console.log('%c', element)
      } catch {
        // Ignore errors
      }
    }

    // Method 4: Check for dev tools specific objects
    const checkDevToolsObject = () => {
      if (typeof (window as unknown as { devtools?: unknown }).devtools !== 'undefined' && !devToolsOpened) {
        devToolsOpened = true
        setIsDevToolsOpen(true)
        setDevToolsMethod('DevTools object detected')
      }
    }

    // Disable right-click context menu
    const disableContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Disable keyboard shortcuts for dev tools
    const disableDevToolsShortcuts = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault()
        setIsDevToolsOpen(true)
        setDevToolsMethod('F12 key pressed')
        return false
      }
      
      // Ctrl+Shift+I (Inspector) or Cmd+Opt+I (Mac)
      if ((e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) || 
          (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i'))) {
        e.preventDefault()
        setIsDevToolsOpen(true)
        setDevToolsMethod('Inspector shortcut pressed')
        return false
      }
      
      // Ctrl+Shift+J (Console) or Cmd+Opt+J (Mac)
      if ((e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) || 
          (e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j'))) {
        e.preventDefault()
        setIsDevToolsOpen(true)
        setDevToolsMethod('Console shortcut pressed')
        return false
      }
      
      // Ctrl+Shift+C (Elements) or Cmd+Opt+C (Mac)
      if ((e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) || 
          (e.metaKey && e.altKey && (e.key === 'C' || e.key === 'c'))) {
        e.preventDefault()
        setIsDevToolsOpen(true)
        setDevToolsMethod('Elements shortcut pressed')
        return false
      }
      
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault()
        setIsDevToolsOpen(true)
        setDevToolsMethod('View Source shortcut pressed')
        return false
      }
      
      // Ctrl+S (Save)
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        return false
      }
    }

    // Add event listeners
    document.addEventListener('contextmenu', disableContextMenu)
    document.addEventListener('keydown', disableDevToolsShortcuts)

    // Start detection intervals
    const windowCheckInterval = setInterval(checkWindowSize, 500)
    const debuggerInterval = setInterval(checkDebugger, 2000)
    const consoleInterval = setInterval(detectConsole, 1000)
    const devToolsCheckInterval = setInterval(checkDevToolsObject, 1000)

    // Initial checks
    checkWindowSize()
    detectConsole()

    return () => {
      document.removeEventListener('contextmenu', disableContextMenu)
      document.removeEventListener('keydown', disableDevToolsShortcuts)
      clearInterval(windowCheckInterval)
      clearInterval(debuggerInterval)
      clearInterval(consoleInterval)
      clearInterval(devToolsCheckInterval)
    }
  }, [])

  return (
    <AnimatePresence>
      {isDevToolsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.95)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl"
            style={{ background: '#202c33' }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-center px-6 py-5"
              style={{ background: '#00a884' }}
            >
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-white" />
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  Dev Tools Disabled
                </h1>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
                <AlertTriangle className="h-10 w-10 text-red-500" />
              </div>

              <h2 className="mb-3 text-xl font-semibold text-white">
                Developer Tools Detected
              </h2>
              
              <p className="mb-6 text-gray-400">
                Please close developer tools to use this application.
              </p>

              {devToolsMethod && (
                <div className="mb-6 rounded-lg bg-white/5 px-4 py-3">
                  <p className="text-sm text-gray-500">
                    Detection method: <span className="text-gray-300">{devToolsMethod}</span>
                  </p>
                </div>
              )}

              <div className="space-y-2 text-sm text-gray-500">
                <p>Close DevTools and refresh the page to continue.</p>
                <p className="text-xs text-gray-600">
                  Press F5 or Ctrl+R to refresh after closing DevTools
                </p>
              </div>
            </div>

            {/* Footer */}
            <div 
              className="px-6 py-4 text-center"
              style={{ background: 'rgba(0, 0, 0, 0.2)' }}
            >
              <p className="text-xs text-gray-500">
                LoyalChat Security • Protected by DevTools Detection
              </p>
            </div>

            {/* Close button (for testing - can be removed in production) */}
            <button
              onClick={() => setIsDevToolsOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              title="Close (for testing)"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
