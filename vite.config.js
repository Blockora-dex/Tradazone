import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Read VITE_BASE_PATH from the active .env file so the build base matches
  // the deployment target automatically:
  //   GitHub Pages  → VITE_BASE_PATH=/Tradazone/  (set in deploy.yml)
  //   Custom domain → VITE_BASE_PATH=/             (set when app.tradazone.com is live)
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE_PATH || '/'

  return {
    plugins: [react()],
    base,
    test: {
      environment: 'jsdom',
      setupFiles:  ['./src/test/setup.ts'],
      globals:     true,
      // Legacy tests in src/test/ were written for the old localStorage DataContext.
      // They are excluded from CI until updated for the Supabase architecture.
      // Run locally with: npx vitest run src/test/
      include: [
        'src/test/sep38.test.ts',
        'src/test/webhook.test.ts',
        'src/test/currency.test.ts',
        'src/test/dateUtils.test.ts',
        'src/test/checkoutCsv.test.ts',
        'src/test/useDebounce.test.tsx',
        'src/test/useVirtualList.test.tsx',
      ],
      exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    },
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
              if (id.includes('/@supabase/')) return 'supabase';
            if (id.includes('/@walletconnect/') || id.includes('/walletconnect/')) return 'walletconnect';
            if (id.includes('/posthog-js/')) return 'analytics';
              if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router')) return 'vendor';
            }
          },
        },
      },
    },
  }
})
