import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            /\/react\//.test(id)
          ) {
            return 'vendor-react'
          }

          if (id.includes('@mui/') || id.includes('@emotion/')) {
            return 'vendor-mui'
          }

          if (id.includes('@reduxjs/') || id.includes('react-redux')) {
            return 'vendor-redux'
          }
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
})
