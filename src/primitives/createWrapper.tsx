import { createSignal } from 'solid-js'

export function createWrapper() {
  // eslint-disable-next-line solid/reactivity
  return createSignal<HTMLDivElement | null>(null)
}
