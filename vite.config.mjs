import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const repoName = process.env.GITHUB_REPOSITORY?.split('/').pop();
const isCI = Boolean(process.env.GITHUB_ACTIONS);

export default defineConfig({
  base: isCI && repoName ? `/${repoName}/` : '/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['docs/manual.html', 'docs/cheatsheet.html', 'icons/*.png'],
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,svg}']
      },
      manifest: {
        name: 'Dogalog - Prolog Livecoding',
        short_name: 'Dogalog',
        description: 'Realtime Prolog-based livecoding music environment',
        form_factor: 'wide',
        theme_color: '#7ee787',
        background_color: '#0b0c10',
        display: 'standalone',
        start_url: './',
        scope: './',
        protocol_handlers: [
          {
            protocol: 'web+dogalog',
            url: './?program=%s'
          }
        ],
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'tests/**',
        'vite.config.mjs',
        '**/*.test.js',
        'src/ui/defaultProgram.js',
        'src/ui/examples.js',
        'src/ui/prologLanguage.js'
      ],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 70,
        statements: 75
      }
    }
  }
});
