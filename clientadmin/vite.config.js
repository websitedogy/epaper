import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodeResolve } from '@rollup/plugin-node-resolve';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), nodeResolve()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    },
    // Handle client-side routing for SPA with specific rewrites
    historyApiFallback: {
      rewrites: [
        { from: /^\/admin\/.*$/, to: '/index.html' },
        { from: /^\/$/, to: '/index.html' }
      ],
      disableDotRule: true,
      verbose: true
    }
  },
  build: {
    rollupOptions: {
      external: ['pdfjs-dist/build/pdf.worker.min.mjs'],
    },
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist/build/pdf.worker.min.mjs', 'monaco-editor'],
    include: [
      'monaco-editor/esm/vs/language/json/json.worker',
      'monaco-editor/esm/vs/language/css/css.worker',
      'monaco-editor/esm/vs/language/html/html.worker',
      'monaco-editor/esm/vs/language/typescript/ts.worker',
      'monaco-editor/esm/vs/editor/editor.worker'
    ]
  },
  worker: {
    format: 'es',
    plugins: () => [react()],
    rollupOptions: {
      external: ['pdfjs-dist/build/pdf.worker.min.mjs'],
    }
  }
});