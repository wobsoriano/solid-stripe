import type { APIEvent } from '@solidjs/start/server'
import { stripe } from '~/lib/stripe'

export async function POST({ request }: APIEvent) {
  const body = await request.json()
  const result = await stripe.paymentIntents.create(body)

  return result
}
