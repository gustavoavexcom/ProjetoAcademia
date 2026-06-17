import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // Resolve o pacote compartilhado direto do código-fonte TS. Evita que o
      // rollup falhe ao detectar os enums exportados do bundle CommonJS (dist).
      '@academia/shared': fileURLToPath(
        new URL('../../packages/shared/src/index.ts', import.meta.url),
      ),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sistema de Academia',
        short_name: 'Academia',
        description: 'Gestão de academia — alunos, planos, treinos e acesso',
        theme_color: '#0d1117',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      // encaminha chamadas /api para o backend NestJS em dev
      '/api': 'http://localhost:3000',
    },
  },
});
