import { fileURLToPath } from 'node:url'
import solid from '@solidjs/vite-plugin'
import { fileRoutes } from 'filesystem-routing/vite'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  resolve: {
    alias: { '~': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    solid({
      start: true,
      ssr: true,
      serverFunctions: true,
      extensions: ['.jsx', '.tsx'],
    }),
    fileRoutes({ types: true }),
    nitro({ preset: 'vercel', serverEntry: false }),
  ],
})
