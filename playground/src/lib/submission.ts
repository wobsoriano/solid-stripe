import type { FormAction } from '@solidjs/router'
import { createOptimistic, createSignal } from 'solid-js'

/**
 * The latest submission of a form action. Router 2 has no pending flag, and its
 * useSubmissions list keeps an old error after you navigate away and come back.
 */
export function useSubmission<T extends any[], U>(action: FormAction<T, U>) {
  const [pending, setPending] = createOptimistic(false)
  const [error, setError] = createSignal<Error>()
  action.onSubmit(() => {
    setPending(true)
  })
  action.onSettled(submission => {
    setError(submission.error)
  })
  return {
    pending,
    error: () => (pending() ? undefined : error()),
  }
}
