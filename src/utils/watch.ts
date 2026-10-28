import { createEffect, on, untrack } from 'solid-js'

/**
 * Calls `fn` with the new and previous value each time `source` changes, skipping the initial value.
 * Unlike `on(source, fn, { defer: true })`, the first call receives the real previous value.
 */
export const watch = <T>(source: () => T, fn: (value: T, prev: T) => void) => {
  let prev = untrack(source)
  createEffect(
    on(
      source,
      value => {
        const last = prev
        prev = value
        fn(value, last)
      },
      { defer: true },
    ),
  )
}
