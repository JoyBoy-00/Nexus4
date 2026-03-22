import { defineConfig, loadEnv, type ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const FIREBASE_SW_ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const applyFirebaseEnvTemplate = (
  content: string,
  env: Record<string, string>
) =>
  FIREBASE_SW_ENV_KEYS.reduce(
    (updated, key) => updated.replaceAll(`__${key}__`, env[key] ?? ''),
    content
  );

const firebaseMessagingSwEnvPlugin = (env: Record<string, string>) => ({
  name: 'firebase-messaging-sw-env',
  configureServer(server: {
    middlewares: {
      use: (
        path: string,
        handler: (
          _req: unknown,
          res: {
            setHeader: (name: string, value: string) => void;
            end: (body: string) => void;
          }
        ) => void
      ) => void;
    };
  }) {
    server.middlewares.use('/firebase-messaging-sw.js', (_req, res) => {
      const swTemplatePath = resolve(
        process.cwd(),
        'public/firebase-messaging-sw.js'
      );
      const swTemplate = readFileSync(swTemplatePath, 'utf8');
      const injectedContent = applyFirebaseEnvTemplate(swTemplate, env);

      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.end(injectedContent);
    });
  },
  writeBundle(options: { dir?: string; file?: string }) {
    const outDir = options.dir ?? process.cwd();
    const swOutputPath = resolve(outDir, 'firebase-messaging-sw.js');

    const swOutput = readFileSync(swOutputPath, 'utf8');
    const injectedOutput = applyFirebaseEnvTemplate(swOutput, env);

    writeFileSync(swOutputPath, injectedOutput, 'utf8');
  },
});

export default defineConfig(({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), '');
  const CI_CHUNK_BUDGET_KB = 800;
  const isAnalyzeBuild = mode === 'analyze' || env.VITE_ANALYZE === 'true';

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'icon-192x192.png',
          'icon-512x512.png',
          'icon-maskable-512x512.png',
          'apple-touch-icon.png',
          'offline.html',
        ],
        manifest: false,
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}'],
          navigateFallback: 'index.html',
          runtimeCaching: [
            {
              urlPattern: ({ request }) =>
                ['style', 'script', 'worker'].includes(request.destination),
              handler: 'CacheFirst',
              options: {
                cacheName: 'nexus-static-assets-v1',
              },
            },
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'nexus-image-assets-v1',
              },
            },
            {
              urlPattern: ({ request }) => request.destination === 'font',
              handler: 'CacheFirst',
              options: {
                cacheName: 'nexus-font-assets-v1',
              },
            },
          ],
        },
      }),
      firebaseMessagingSwEnvPlugin(env),
      ...(isAnalyzeBuild
        ? [
            visualizer({
              filename: 'dist/stats.html',
              open: false,
              gzipSize: true,
              brotliSize: true,
            }),
          ]
        : []),
    ],
    server: {
      host: true,
      port: 3001,
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development' || mode === 'analyze',
      minify: 'terser',
      target: 'es2017',
      esbuild: {
        target: 'es2017',
      },
      chunkSizeWarningLimit: CI_CHUNK_BUDGET_KB,
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('tiptap') || id.includes('prosemirror'))
                return 'vendor-editor';
              if (id.includes('firebase')) return 'vendor-firebase';
              if (id.includes('socket.io')) return 'vendor-socket';
              if (id.includes('lucide-react')) return 'vendor-lucide';
              if (id.includes('jwt-decode')) return 'vendor-auth-utils';
              if (id.includes('dayjs')) return 'vendor-dayjs';
              if (id.includes('dexie')) return 'vendor-storage';
              if (id.includes('zustand')) return 'vendor-state';
              if (id.includes('recharts')) return 'vendor-recharts';

              if (id.includes('@mui')) return 'vendor-mui';
              if (id.includes('@emotion')) return 'vendor-emotion';
              if (id.includes('@radix-ui')) return 'vendor-radix';
              if (id.includes('motion-dom')) return 'vendor-motion-dom';
              if (id.includes('framer-motion')) return 'vendor-motion';
              if (id.includes('@floating-ui')) return 'vendor-floating';
              if (id.includes('date-fns')) return 'vendor-date';
              if (id.includes('axios')) return 'vendor-axios';

              return 'vendor-misc';
            }

            return undefined;
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          entryFileNames: 'assets/[name]-[hash].js',
        },
        input: {
          main: '/index.html',
        },
      },
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@mui/material',
        '@mui/material/styles',
        '@emotion/react',
        '@emotion/styled',
        '@mui/styled-engine',
        '@floating-ui/react',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-tooltip',
      ],
    },
  };
});
