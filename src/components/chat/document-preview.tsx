'use client'

import { motion } from 'framer-motion'
import {
  Download, FileText, File, X, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface DocumentPreviewProps {
  fileName?: string
  fileSize?: number
  fileUrl?: string
  fileMimeType?: string
  isOwn: boolean
}

export function DocumentPreview({
  fileName,
  fileSize,
  fileUrl,
  fileMimeType,
  isOwn,
}: DocumentPreviewProps) {
  const [showPreview, setShowPreview] = useState(false)

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return File
    if (mimeType.includes('pdf')) return FileText
    if (mimeType.includes('word') || mimeType.includes('document')) return FileText
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return FileText
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return FileText
    return FileText
  }

  const getFileColor = (mimeType?: string) => {
    if (!mimeType) return 'text-gray-500 dark:text-gray-400'
    if (mimeType.includes('pdf')) return 'text-red-600 dark:text-red-400'
    if (mimeType.includes('word') || mimeType.includes('document')) return 'text-blue-600 dark:text-blue-400'
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'text-green-600 dark:text-green-400'
    if (mimeType.includes('presentation')) return 'text-orange-600 dark:text-orange-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getFileBgColor = (mimeType?: string) => {
    if (!mimeType) return 'bg-gray-100 dark:bg-slate-700'
    if (mimeType.includes('pdf')) return 'bg-red-100 dark:bg-red-900/30'
    if (mimeType.includes('word') || mimeType.includes('document')) return 'bg-blue-100 dark:bg-blue-900/30'
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'bg-green-100 dark:bg-green-900/30'
    if (mimeType.includes('presentation')) return 'bg-orange-100 dark:bg-orange-900/30'
    return 'bg-gray-100 dark:bg-slate-700'
  }

  const FileIcon = getFileIcon(fileMimeType)
  const fileColor = getFileColor(fileMimeType)
  const fileBgColor = getFileBgColor(fileMimeType)

  const handleDownload = () => {
    if (fileUrl && fileName) {
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-2xl border-2 transition-all ${
          isOwn
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50'
            : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-600'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* File Icon Container */}
          <div className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center ${fileBgColor}`}>
            <FileIcon className={`w-6 h-6 md:w-7 md:h-7 ${fileColor}`} />
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm md:text-base text-gray-900 dark:text-white truncate" title={fileName}>
              {fileName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {fileSize ? `${(fileSize / 1024 / 1024).toFixed(2)} MB` : 'File'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            {fileUrl && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg"
                  onClick={() => setShowPreview(true)}
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg"
                  onClick={handleDownload}
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Preview Modal */}
      {showPreview && fileUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-auto relative"
          >
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-4 right-4 h-8 w-8 p-0 z-10 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full"
              onClick={() => setShowPreview(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="p-6">
              <iframe
                src={fileUrl}
                className="w-full h-[70vh] rounded-lg border border-gray-200 dark:border-slate-700"
                title={fileName}
              />
              <Button
                size="sm"
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
