import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Tradazone/',
  build: {
    rollupOptions: {
      output: {
        // Vite 8 (Rolldown) requires manualChunks to be a function, not an object.
        manualChunks(id) {
          if (id.includes('/node_modules/')) {
            if (id.includes('/chart.js/') || id.includes('/react-chartjs-2/')) return 'charts';
            if (id.includes('/stellar-sdk/')) return 'stellar';
            if (id.includes('/starknet/')) return 'starknet';
            if (id.includes('/ethers/')) return 'ethereum';
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router')) return 'vendor';
          }
        },
      },
    },
  },
})
