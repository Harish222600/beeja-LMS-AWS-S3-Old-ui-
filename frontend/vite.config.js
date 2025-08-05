import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  build: {
    // Increase chunk size warning limit to 1000kb
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Redux and state management
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          
          // UI and styling libraries
          'ui-vendor': [
            'framer-motion',
            'react-icons',
            'react-hot-toast',
            'react-rating-stars-component',
            'tailwind-scrollbar'
          ],
          
          // Chart and visualization libraries
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          
          // File and document processing
          'document-vendor': [
            'jspdf',
            'jspdf-autotable',
            'html2canvas',
            'file-saver',
            'xlsx'
          ],
          
          // Code editor and Monaco
          'editor-vendor': ['@monaco-editor/react'],
          
          // Form and input libraries
          'form-vendor': [
            'react-hook-form',
            'react-otp-input',
            'react-datepicker',
            'react-dropzone'
          ],
          
          // Media and carousel libraries
          'media-vendor': [
            'video-react',
            'react-owl-carousel',
            'owl.carousel',
            'swiper',
            'react-lazy-load-image-component'
          ],
          
          // Utility libraries
          'utils-vendor': [
            'axios',
            'socket.io-client',
            'qrcode',
            'copy-to-clipboard',
            'canvas-confetti',
            'jquery'
          ],
          
          // DnD and interaction libraries
          'interaction-vendor': [
            '@dnd-kit/core',
            '@dnd-kit/modifiers',
            '@dnd-kit/sortable',
            '@dnd-kit/utilities'
          ]
        }
      }
    }
  }
})
