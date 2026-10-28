import type { APIEvent } from '@solidjs/start/server'
import { getStripe } from '~/lib/stripe'

export async function POST({ request }: APIEvent) {
  const body = await request.json()
  const result = await getStripe().paymentIntents.create(body)

  return result
}
