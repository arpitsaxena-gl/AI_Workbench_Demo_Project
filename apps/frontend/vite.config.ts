import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    // Use Vite default port (5173) to avoid conflict with backend (which defaults to 3000)
    port: 5173,
    open: true,
    // Proxy API requests to the backend running on port 3000
    proxy: {
      '^/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // keep /api/v1 paths intact
      },
    },
  },
});
