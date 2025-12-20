import { defineConfig } from 'vite';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import electron from 'vite-plugin-electron/simple';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'src/main/index.ts',
        vite: {
          resolve: {
            alias: {
              '@': path.resolve(__dirname, 'src'),
            },
          },
          build: {
            outDir: 'dist-electron/main',
            target: 'es2022',
            rollupOptions: {
              output: {
                format: 'es',
              },
            },
          },
        },
      },
      preload: {
        input: 'src/main/preload.ts',
        vite: {
          resolve: {
            alias: {
              '@': path.resolve(__dirname, 'src'),
            },
          },
          build: {
            outDir: 'dist-electron/preload',
            rollupOptions: {
              output: {
                format: 'cjs',
                entryFileNames: 'preload.js', // Explicitly output as .js for CJS
              },
            },
          },
        },
      },
      renderer: {},
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
