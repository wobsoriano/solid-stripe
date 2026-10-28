'use server'
import { getRequestEvent } from 'solid-js/web'
import { MAX_QUANTITY, UNIT_AMOUNT } from './pricing'
import { getStripe } from './stripe'

/** Creates a one-item Checkout Session and returns its client secret. */
export async function createCheckoutSession(uiMode: 'elements' | 'embedded_page') {
  const origin = new URL(getRequestEvent()!.request.url).origin
  const session = await getStripe().checkout.sessions.create({
    ui_mode: uiMode,
    mode: 'payment',
    allow_promotion_codes: true,
    line_items: [
      {
        quantity: 1,
        adjustable_quantity: { enabled: true, minimum: 1, maximum: MAX_QUANTITY },
        price_data: {
          currency: 'usd',
          unit_amount: UNIT_AMOUNT,
          product_data: { name: 'Solid Stripe T-shirt' },
        },
      },
    ],
    return_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
  })
  return session.client_secret!
}
