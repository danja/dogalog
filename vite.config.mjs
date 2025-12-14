import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const repoName = process.env.GITHUB_REPOSITORY?.split('/').pop();
const isCI = Boolean(process.env.GITHUB_ACTIONS);
const base = isCI && repoName ? `/${repoName}/` : '/';

export default defineConfig({
  base,
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      includeAssets: ['docs/manual.html', 'docs/cheatsheet.html', 'icons/*.png'],
      manifest: {
        name: 'Dogalog - Prolog Livecoding',
        short_name: 'Dogalog',
        description: 'Realtime Prolog-based livecoding music environment',
        form_factor: 'wide',
        theme_color: '#7ee787',
        background_color: '#0b0c10',
        display: 'standalone',
        start_url: base,
        scope: base,
        id: base,
        protocol_handlers: [
          {
            protocol: 'web+dogalog',
            url: `${base}?program=%s`
          }
        ],
        icons: [
          {
            src: `${base}icons/icon-192.png`,
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: `${base}icons/icon-512.png`,
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: `${base}icons/icon-maskable-512.png`,
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
