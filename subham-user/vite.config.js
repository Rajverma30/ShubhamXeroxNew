import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Fail rather than silently move to another port: the backend's CORS
    // allow-list is keyed on this origin, so a port change breaks every request.
    strictPort: true,
    proxy: {
      '/sitemap.xml': { target: 'http://localhost:5005', changeOrigin: true },
      '/robots.txt': { target: 'http://localhost:5005', changeOrigin: true },
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          swiper: ['swiper', 'swiper/react'],
        },
      },
    },
  },
});
