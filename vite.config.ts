/// <reference types="vitest/config" />

import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron/simple';

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
                entryFileNames: 'preload.js',
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
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['node_modules', 'dist', 'dist-electron'],
    setupFiles: ['./tests/unit/setup.ts'],
    mockReset: true,
    server: {
      deps: {
        inline: [/vite-electron-renderer/],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/vite-env.d.ts',
        'src/main/index.ts',
        'src/preload/index.ts',
        'src/main/lib/perf.ts',
        'src/renderer/lib/perf.ts',
      ],
    },
  },
});
