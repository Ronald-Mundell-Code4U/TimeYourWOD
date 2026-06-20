import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
  },
  build: {
    target: 'chrome76',
  },
  esbuild: {
    target: 'chrome76',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'chrome76',
    },
  },
});
