import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist/lib',
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        react: resolve(__dirname, 'src/react/index.ts'),
        component: resolve(__dirname, 'src/component.ts')
      },
      name: 'PdfHtml5PageFlip',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'pdfjs-dist',
        'page-flip'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'page-flip': 'StPageFlip',
          'pdfjs-dist': 'pdfjsLib'
        }
      }
    },
    sourcemap: true,
    emptyOutDir: true
  }
});
