// Compares the runtime exports of @stripe/react-stripe-js with the built solid-stripe package.
// Usage: vp pack && node --conditions=browser scripts/check-parity.mjs <path to a react-stripe-js checkout>
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const upstream = process.argv[2]
if (!upstream) throw new Error('usage: check-parity.mjs <react-stripe-js dir>')

const entries = [
  { upstream: 'src/index.ts', local: 'dist/index.js' },
  { upstream: 'src/checkout/index.ts', local: 'dist/checkout.js' },
]

/** Value exports declared in an upstream entry: `export const X`, `export {X} from`, minus type-only names. */
const upstreamValueExports = file => {
  const source = readFileSync(join(upstream, file), 'utf8')
  const names = new Set()
  for (const [, name] of source.matchAll(/^export const (\w+)/gm)) names.add(name)
  for (const [, list] of source.matchAll(/^export \{([^}]+)\} from/gm)) {
    for (const name of list.split(',').map(part => part.trim())) {
      // Upstream exports some types through value-style lists; types start with `Stripe`.
      if (name && !/^Stripe[A-Z]/.test(name)) names.add(name)
    }
  }
  return names
}

let failed = false
for (const entry of entries) {
  const expected = upstreamValueExports(entry.upstream)
  const actual = new Set(Object.keys(await import(pathToFileURL(entry.local).href)))
  const byName = (a, b) => a.localeCompare(b)
  const missing = [...expected].filter(name => !actual.has(name)).sort(byName)
  const extra = [...actual].filter(name => !expected.has(name)).sort(byName)

  console.log(
    `${entry.upstream} -> ${entry.local}: ${expected.size} upstream, ${actual.size} local`,
  )
  if (missing.length) {
    failed = true
    console.log(`  missing: ${missing.join(', ')}`)
  }
  if (extra.length) console.log(`  extra: ${extra.join(', ')}`)
}

if (failed) process.exit(1)
console.log('parity: every upstream runtime export is present')
