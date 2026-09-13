import { resolve } from 'path'
import { defineConfig, swcPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import swc from 'vite-plugin-swc-transform'

export default defineConfig({
  main: {
    build: {
      target: 'node*',
      sourcemap: true,
      rollupOptions: {
        external: ['electron', 'reflect-metadata']
      }
    },
    esbuild: false,
    plugins: [swcPlugin()],
    resolve: {
      alias: {
        '@main': resolve(__dirname, './src/main')
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, './src/preload/index.ts'),
          login: resolve(__dirname, './src/preload/index.ts'),
          lyric: resolve(__dirname, './src/preload/index.ts')
        }
      }
    }
  },
  renderer: {
    build: {
      sourcemap: true,
      rollupOptions: {
        input: {
          index: resolve(__dirname, './src/renderer/index.html'),
          login: resolve(__dirname, './src/renderer/login.html'),
          lyric: resolve(__dirname, './src/renderer/lyric.html')
        }
      }
    },
    optimizeDeps: {
      exclude: ['@virid/core', '@virid/vue']
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src/renderer/src'),
        '@components': resolve(__dirname, './src/renderer/src/components'),
        '@assets': resolve(__dirname, './src/renderer/src/assets'),
        '@core': resolve(__dirname, './src/renderer/src/core'),
        '@utils': resolve(__dirname, './src/renderer/src/utils'),
        '@services': resolve(__dirname, './src/renderer/src/services'),
        '@controllers': resolve(__dirname, './src/renderer/src/controllers')
      }
    },
    esbuild: false,
    plugins: [
      vue(),
      tailwindcss(),
      swc({
        swcOptions: {
          jsc: {
            parser: {
              syntax: 'typescript',
              decorators: true,
              dynamicImport: true
            },
            transform: {
              legacyDecorator: true,
              decoratorMetadata: true,
              useDefineForClassFields: false
            }
          }
        }
      })
    ]
  }
})
