import { defineConfig, loadEnv, type ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), '');
  const CI_CHUNK_BUDGET_KB = 800;

  return {
    plugins: [
      react(),
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
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
