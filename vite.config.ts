import solidRolldown from 'unplugin-solid/rolldown'
import solid from 'unplugin-solid/vite'
import { defineConfig } from 'vite-plus'

const entry = { index: 'src/index.tsx' }

export default defineConfig({
  plugins: [solid({ hot: false })],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
  pack: [
    {
      entry,
      platform: 'neutral',
      target: 'esnext',
      dts: true,
      plugins: [solidRolldown()],
    },
    {
      // Uncompiled JSX for the `solid` export condition, so Solid-aware bundlers
      // can compile it for their own target (dom, ssr, or hydratable).
      entry,
      platform: 'neutral',
      target: 'esnext',
      dts: false,
      inputOptions: {
        transform: { jsx: 'preserve' },
        checks: { configurationFieldConflict: false },
      },
      outExtensions: () => ({ js: '.jsx' }),
    },
  ],
  fmt: {
    semi: false,
    singleQuote: true,
    printWidth: 100,
    trailingComma: 'all',
    arrowParens: 'avoid',
    ignorePatterns: ['CHANGELOG.md'],
  },
  lint: {
    ignorePatterns: ['dist/**', 'playground/**'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      'no-console': ['warn', { allow: ['warn'] }],
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
})
