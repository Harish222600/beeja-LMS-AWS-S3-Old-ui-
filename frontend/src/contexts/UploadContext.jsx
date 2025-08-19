import { createContext, useContext, useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

const UploadContext = createContext()

export const useUpload = () => {
  const context = useContext(UploadContext)
  if (!context) {
    throw new Error('useUpload must be used within an UploadProvider')
  }
  return context
}

export const UploadProvider = ({ children }) => {
  const [activeUploads, setActiveUploads] = useState(new Map())

  // Generate unique upload ID
  const generateUploadId = useCallback(() => {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Register a new upload
  const registerUpload = useCallback((uploadId, uploadData) => {
    console.log('📝 Registering upload:', uploadId, uploadData)
    setActiveUploads(prev => {
      const newMap = new Map(prev)
      newMap.set(uploadId, {
        ...uploadData,
        id: uploadId,
        registeredAt: Date.now()
      })
      return newMap
    })
  }, [])

  // Unregister an upload
  const unregisterUpload = useCallback((uploadId) => {
    console.log('🗑️ Unregistering upload:', uploadId)
    setActiveUploads(prev => {
      const newMap = new Map(prev)
      newMap.delete(uploadId)
      return newMap
    })
  }, [])

  // Update upload progress
  const updateUploadProgress = useCallback((uploadId, progressData) => {
    setActiveUploads(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(uploadId)
      if (existing) {
        newMap.set(uploadId, {
          ...existing,
          ...progressData,
          lastUpdated: Date.now()
        })
      }
      return newMap
    })
  }, [])

  // Cancel a specific upload
  const cancelUpload = useCallback((uploadId) => {
    console.log('🚫 Cancelling upload:', uploadId)
    const upload = activeUploads.get(uploadId)
    
    if (upload) {
      try {
        // Cancel the upload using its abort controller
        if (upload.abortController) {
          upload.abortController.abort()
        }
        
        // Call the upload's cancel method if available
        if (upload.uploader && typeof upload.uploader.cancel === 'function') {
          upload.uploader.cancel()
        }
        
        // Update upload status
        updateUploadProgress(uploadId, {
          status: 'cancelled',
          error: 'Upload cancelled by user'
        })
        
        console.log('✅ Upload cancelled successfully:', uploadId)
        return true
      } catch (error) {
        console.error('❌ Error cancelling upload:', uploadId, error)
        return false
      }
    } else {
      console.warn('⚠️ Upload not found for cancellation:', uploadId)
      return false
    }
  }, [activeUploads, updateUploadProgress])

  // Cancel all active uploads
  const cancelAllUploads = useCallback(() => {
    console.log('🚫 Cancelling all uploads. Active uploads:', activeUploads.size)
    
    let cancelledCount = 0
    let errorCount = 0
    
    activeUploads.forEach((upload, uploadId) => {
      try {
        const success = cancelUpload(uploadId)
        if (success) {
          cancelledCount++
        } else {
          errorCount++
        }
      } catch (error) {
        console.error('❌ Error cancelling upload:', uploadId, error)
        errorCount++
      }
    })
    
    console.log(`📊 Upload cancellation summary: ${cancelledCount} cancelled, ${errorCount} errors`)
    
    if (cancelledCount > 0) {
      toast.success(`Cancelled ${cancelledCount} upload${cancelledCount !== 1 ? 's' : ''}`)
    }
    
    if (errorCount > 0) {
      toast.error(`Failed to cancel ${errorCount} upload${errorCount !== 1 ? 's' : ''}`)
    }
    
    return { cancelled: cancelledCount, errors: errorCount }
  }, [activeUploads, cancelUpload])

  // Get upload status
  const getUploadStatus = useCallback((uploadId) => {
    return activeUploads.get(uploadId) || null
  }, [activeUploads])

  // Get all active uploads
  const getAllActiveUploads = useCallback(() => {
    return Array.from(activeUploads.values())
  }, [activeUploads])

  // Check if there are any active uploads
  const hasActiveUploads = useCallback(() => {
    return activeUploads.size > 0
  }, [activeUploads])

  const contextValue = {
    // State
    activeUploads: Array.from(activeUploads.values()),
    
    // Methods
    generateUploadId,
    registerUpload,
    unregisterUpload,
    updateUploadProgress,
    cancelUpload,
    cancelAllUploads,
    getUploadStatus,
    getAllActiveUploads,
    hasActiveUploads
  }

  return (
    <UploadContext.Provider value={contextValue}>
      {children}
    </UploadContext.Provider>
  )
}

export default UploadContext
