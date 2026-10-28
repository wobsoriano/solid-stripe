'use server'
import { getRequestEvent } from 'solid-js/web'
import { getStripe } from './stripe'

/** Creates a one-item Checkout Session and returns its client secret. */
export async function createCheckoutSession(uiMode: 'elements' | 'embedded_page') {
  const origin = new URL(getRequestEvent()!.request.url).origin
  const session = await getStripe().checkout.sessions.create({
    ui_mode: uiMode,
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: 1099,
          product_data: { name: 'Solid Stripe T-shirt' },
        },
      },
    ],
    return_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
  })
  return session.client_secret!
}
