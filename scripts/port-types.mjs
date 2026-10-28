// Ports @stripe/react-stripe-js type declarations to Solid.
// Usage: node scripts/port-types.mjs <react-stripe-js>/src/types/index.ts src/types.ts
import { readFileSync, writeFileSync } from 'node:fs'

const [from, to] = process.argv.slice(2)
if (!from || !to) throw new Error('usage: port-types.mjs <from> <to>')

const rules = [
  [
    /^import \{FunctionComponent\} from 'react';\n/m,
    "import type { Component } from 'solid-js';\n",
  ],
  [
    /^import \{FunctionComponent, PropsWithChildren\} from 'react';\n/m,
    "import type { Component } from 'solid-js';\n",
  ],
  [/\bFunctionComponent</g, 'Component<'],
  [/^(\s*)className\?: string;/gm, '$1class?: string;'],
]

let source = readFileSync(from, 'utf8').replace(/\r\n/g, '\n')
for (const [pattern, replacement] of rules) source = source.replace(pattern, replacement)

const leftovers = source.match(/from 'react'|\bReact\.|FunctionComponent|className/g)
if (leftovers)
  throw new Error(`unported React references remain: ${[...new Set(leftovers)].join(', ')}`)

writeFileSync(to, source)
