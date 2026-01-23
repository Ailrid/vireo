import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@components': resolve(__dirname, './src/renderer/src/components'),
        '@': resolve(__dirname, './src/renderer/src'),
        '@assets': resolve(__dirname, './src/renderer/src/assets')
      }
    },
    plugins: [vue(), tailwindcss()]
  }
})
