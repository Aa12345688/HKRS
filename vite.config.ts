import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import compression from 'vite-plugin-compression'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { IncomingMessage, ServerResponse } from 'http'

const localApiPlugin = () => {
  const dbPath = path.resolve(__dirname, 'hkrs-db.json')
  return {
    name: 'local-api-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/sync', (req: IncomingMessage, res: ServerResponse) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
          res.end();
          return;
        }
        if (req.method === 'GET') {
          if (fs.existsSync(dbPath)) {
            res.setHeader('Content-Type', 'application/json')
            res.end(fs.readFileSync(dbPath))
          } else {
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'No db found' }))
          }
        } else if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: any) => { body += chunk.toString() })
          req.on('end', () => {
            fs.writeFileSync(dbPath, body)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true }))
          })
        }
      })
    }
  }
}

export default defineConfig({
  base: "/HKRS/",
  plugins: [
    basicSsl(),
    localApiPlugin(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used  do not remove them
    react(),
    tailwindcss(),
    compression(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-icon.png'],
      manifest: {
        name: '皇凱貿易-HKRS 庫存管理系統',
        short_name: 'HKRS Stock',
        description: 'HKRS 機車改裝零件庫存與進出貨管理系統。',
        theme_color: '#0a0c10',
        background_color: '#0a0c10',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/apple-icon.png',
            sizes: '1024x1024',
            type: 'image/png'
          },
          {
            src: '/apple-icon.png',
            sizes: '192x192 512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,onnx,wasm}'],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50MB for model and wasm
      }
    }),
  ],
  server: {
    allowedHosts: true,
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    minify: 'esbuild',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'ui-vendor': ['lucide-react', 'motion'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    sourcemap: false,
  },
  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
