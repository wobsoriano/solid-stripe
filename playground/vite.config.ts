import solid from 'solid-start/vite'
import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import vercel from 'solid-start-vercel'

export default defineConfig((config) => {
  if (config.command === 'serve') {
    return {
      plugins: [basicSsl(), solid({ adapter: vercel() })],
    }
  }

  return {
    plugins: [solid({ adapter: vercel() })],
  }
})
