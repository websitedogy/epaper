import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    historyApiFallback: {
      rewrites: [
        { from: /^\/clip\/.+$/, to: '/index.html' },
        { from: /./, to: '/index.html' }
      ]
    }
  },
  preview: {
    host: true,
    port: 5173,
    strictPort: true,
    historyApiFallback: {
      rewrites: [
        { from: /^\/clip\/.+$/, to: '/index.html' },
        { from: /./, to: '/index.html' }
      ]
    }
  }
})