import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    host: '0.0.0.0'
  },
  preview: {
    port: 5174,
    host: '0.0.0.0'
  },
  build: {
    target: 'esnext'
  }
});
