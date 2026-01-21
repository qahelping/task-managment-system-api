import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Middleware для перехвата запросов к HTML файлам automation-lab
    // Должен быть первым, чтобы перехватывать запросы до обработки статических файлов
    {
      name: 'automation-lab-html-redirect',
      configureServer(server) {
        // Используем middleware с высоким приоритетом
        server.middlewares.use((req, res, next) => {
          // Если запрос к HTML файлу в automation-lab, перенаправляем на React роут
          if (req.url?.match(/^\/automation-lab\/.*\.html$/)) {
            // Убираем .html и перенаправляем на соответствующий роут
            const route = req.url.replace(/\.html$/, '').replace(/\/index$/, '');
            res.writeHead(302, { Location: route });
            res.end();
            return;
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Минификация и оптимизация
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Удалить console.log в production
        drop_debugger: true,
      },
    },
    // Разделение кода на чанки для лучшего кэширования
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'utils-vendor': ['axios', 'zustand', 'date-fns'],
        },
      },
    },
    // Предупреждение при превышении размера чанка
    chunkSizeWarningLimit: 1000,
    // Оптимизация размера
    target: 'es2015',
    cssCodeSplit: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      // Использовать polling только на Windows или если нужно
      // На macOS/Linux используем native file watching (быстрее и меньше нагрузка)
      usePolling: process.platform === 'win32',
      interval: process.platform === 'win32' ? 1000 : undefined,
    },
    // Оптимизация HMR
    hmr: {
      overlay: true,
    },
    // Настройки для Firefox и других браузеров
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // Включить hot reload для статических файлов в public
  publicDir: 'public',
})
