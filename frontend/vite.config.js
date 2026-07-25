import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Warn when chunks exceed 500KB
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          react:    ['react', 'react-dom'],
          router:   ['react-router-dom'],
          charts:   ['recharts'],
          socket:   ['socket.io-client'],
          icons:    ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
