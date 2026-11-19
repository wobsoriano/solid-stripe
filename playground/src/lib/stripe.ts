import { markSafeError } from '@solidjs/web'
import Stripe from 'stripe'

let client: Stripe | undefined

/**
 * Runs a request with one shared client, created on first use so pages still render without a
 * secret key. Production builds replace a server error with a generic one, so the error is marked
 * safe to keep Stripe's message on the page.
 */
export async function requestStripe<T>(request: (stripe: Stripe) => Promise<T>): Promise<T> {
  try {
    return await request((client ??= new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY)))
  } catch (error) {
    throw markSafeError(new Error((error as Error).message))
  }
}
