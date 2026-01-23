import { defineConfig } from 'eslint/config'
import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier'
import eslintPluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default defineConfig(
  { ignores: ['**/node_modules', '**/dist', '**/out'] },
  tseslint.configs.recommended,
  eslintPluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        extraFileExtensions: ['.vue'],
        parser: tseslint.parser
      }
    }
  },
  {
    files: ['**/*.{ts,mts,tsx,vue}'],
    rules: {
      'vue/require-default-prop': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/block-lang': [
        'error',
        {
          script: {
            lang: 'ts'
          }
        }
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      'arrow-parens': ['error', 'as-needed'],
      '@typescript-eslint/no-explicit-any': 'off', // 允许显式使用 any
      '@typescript-eslint/no-implicit-any-catch': 'off', // 允许 catch 块隐式使用 any
      '@typescript-eslint/explicit-module-boundary-types': 'off', // 关闭函数返回值必须声明类型的要求
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_', // 允许以下划线开头的参数不被使用
          varsIgnorePattern: '^_', // 允许以下划线开头的变量不被使用
          caughtErrorsIgnorePattern: '^_' // 允许 catch(_err) 这种写法
        }
      ]
    }
  },
  eslintConfigPrettier
)
