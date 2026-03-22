import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/mobile/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/ui/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
    },
  },
  optimizeDeps: {
    exclude: ["pyodide"],
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) return 'vendor-lucide';
            if (id.includes('recharts')) return 'vendor-recharts';
            if (id.includes('framer-motion')) return 'vendor-framer-motion';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('d3')) return 'vendor-d3';
            if (id.includes('date-fns')) return 'vendor-date-fns';
            return 'vendor';
          }
        },
      },
    },
  },
})
