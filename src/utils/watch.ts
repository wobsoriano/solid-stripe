import { createEffect } from 'solid-js'

/**
 * Calls `fn` with the new and previous value each time `source` changes, skipping the initial value.
 * The effect's `prev` is `undefined` on its first run, including the first one under
 * `{ defer: true }`, so the initial run is skipped here instead of deferred.
 */
export const watch = <T>(source: () => T, fn: (value: T, prev: T) => void) => {
  let started = false
  createEffect(source, (value, prev) => {
    if (started) fn(value, prev as T)
    started = true
  })
}
