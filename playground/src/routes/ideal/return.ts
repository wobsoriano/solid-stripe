import type { APIEvent } from 'solid-start'
import { redirect } from 'solid-start/server'
import Stripe from 'stripe'

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {} as any)

export async function GET({ request }: APIEvent) {
  const url = new URL(request.url)
  const intentId = url.searchParams.get('payment_intent')
  const clientSecret = url.searchParams.get('payment_intent_client_secret')

  if (!intentId || !clientSecret)
    throw new Error('Missing params')

  const paymentIntent = await stripe.paymentIntents.retrieve(intentId)

  if (paymentIntent.client_secret !== clientSecret)
    throw new Error('Client secret mismatch')

  if (paymentIntent.status !== 'succeeded')
    throw redirect('/ideal?error=true')

  return redirect('/success')
}
