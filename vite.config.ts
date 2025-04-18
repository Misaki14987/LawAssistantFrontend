import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  css: {
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      localsConvention: 'camelCase',
      hashPrefix: 'prefix',
    }
  },
  plugins: [react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://121.196.231.200:12350/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
