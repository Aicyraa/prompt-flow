import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Stable vendor chunks: they change far less often than app code, so
        // returning visitors keep them cached across deploys.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
            return 'react'
          }
          if (/node_modules\/(@xyflow|d3-[^/]+)\//.test(id)) return 'flow'
          return undefined
        },
      },
    },
  },
  test: {
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
  },
})
