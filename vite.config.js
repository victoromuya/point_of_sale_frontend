import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' allows loading variables WITHOUT the 'VITE_' prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    build: {
      outDir: path.resolve(__dirname, '../ggi/staticfiles_build/static'),
      emptyOutDir: true,
      assetsDir: 'assets',
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        // Use the loaded API variable here
        '/api': {
          target: env.API || 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
