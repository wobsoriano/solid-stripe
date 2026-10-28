import solidRolldown from 'unplugin-solid/rolldown'
import solid from 'unplugin-solid/vite'
import { defineConfig } from 'vite-plus'

const entry = { index: 'src/index.ts', checkout: 'src/checkout/index.tsx' }

export default defineConfig({
  // unplugin-solid 3.0.0 passes `componentNames` to the compiler in dev mode, which
  // @solidjs/compiler 2.0.0-rc.19 rejects. Its own `dev` stays off and the compiler's is set directly.
  plugins: [solid({ hot: false, dev: false, solid: { dev: true } })],
  // Tests run on the development browser builds of solid-js and @solidjs/web.
  resolve: { conditions: ['browser', 'development'] },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['test/setup.ts'],
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
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    semi: false,
    singleQuote: true,
    printWidth: 100,
    trailingComma: 'all',
    arrowParens: 'avoid',
    ignorePatterns: ['CHANGELOG.md', 'playground/file-routes.d.ts'],
  },
  lint: {
    ignorePatterns: ['dist/**', 'playground/**'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    overrides: [{ files: ['scripts/**'], rules: { 'no-console': 'off' } }],
    rules: {
      'no-console': ['warn', { allow: ['warn'] }],
      // Solid assigns `let ref!: T` through the JSX `ref` prop, which this rule cannot see.
      'no-unassigned-vars': 'off',
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
})
