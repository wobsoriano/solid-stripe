import { isServer } from '@solidjs/web'
import { DEV, OBSERVE } from 'solid-js'
import { afterEach, beforeEach, expect } from 'vite-plus/test'

// Production builds emit no diagnostics, so the guard below would pass vacuously on one.
if (!DEV || !OBSERVE || isServer) {
  throw new Error('Tests must run against the development browser builds of solid-js.')
}

// The structured channel carries every coded `[CODE]` diagnostic the console shows, including
// the ones thrown instead of logged, and keeps reporting while a test mocks `console.warn`.
const diagnostics: string[] = []
OBSERVE.diagnostics.subscribe(event => {
  if (event.severity !== 'info') diagnostics.push(event.message)
})

beforeEach(() => {
  diagnostics.length = 0
})

afterEach(() => {
  expect(diagnostics, 'Solid dev diagnostics').toEqual([])
})
