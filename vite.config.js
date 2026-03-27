import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

// Build size budget limits in KB (Issue #162: Implement production build size monitoring)
const SIZE_LIMITS = {
  // Maximum size for any single chunk (KB)
  maxChunkSize: 550,
  // Maximum size for critical core chunks specifically (KB)
  maxContextSize: 50,
  // Maximum total bundle size (KB)
  maxTotalSize: 1200,
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    // Base path is driven by VITE_BASE_PATH so staging and production
    // can deploy to different sub-paths without code changes.
    base: env.VITE_BASE_PATH || '/Tradazone/',
    build: {
      // Enable compressed size reporting for monitoring bundle sizes (Issue #162)
      reportCompressedSize: true,
      // Set chunk size warnings to prevent large bundles
      chunkSizeWarningLimit: SIZE_LIMITS.maxChunkSize,
      rollupOptions: {
        output: {
          // Manual chunking to optimize loading and monitor critical components (Issue #162)
          manualChunks: (id) => {
            // Context chunks
            if (id.includes('DataContext')) return 'data-context';
            if (id.includes('AuthContext')) return 'auth-context';
            
            // Critical feature chunks for size monitoring
            if (id.includes('SignIn')) return 'sign-in';
            if (id.includes('CustomerList')) return 'customer-list';
            if (id.includes('InvoiceDetail')) return 'invoice-detail';
            if (id.includes('ConnectWalletModal')) return 'connect-wallet';
            
            // Library/Vendor chunks
            if (id.includes('@lobstrco/signer-extension-api') || id.includes('get-starknet') || id.includes('ethers')) {
              return 'wallet';
            }
            if (id.includes('lucide-react')) {
              return 'ui-icons';
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'charts';
            }
            if (id.includes('html2pdf.js')) {
              return 'document-export';
            }
            if (id.includes('react-router-dom') || id.includes('starknet')) {
              return 'core-libs';
            }
          },
        },
      },
    },
    test: {
      environment: 'happy-dom',
      globals: true,
      setupFiles: './src/test/setup.js',
      snapshotFormat: {
        printBasicPrototype: false,
      },
    },
  }
})
