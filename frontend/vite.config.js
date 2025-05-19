import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [
    angular()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    include: ['@angular/common', '@angular/forms']
  },
  build: {
    target: 'es2020',
    outDir: 'dist/frontend'
  }
});
