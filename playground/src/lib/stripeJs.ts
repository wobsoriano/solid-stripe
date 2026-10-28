import { loadStripe, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | undefined

// One Stripe.js instance for every page. loadStripe resolves to null during SSR.
export const getStripeJs = () =>
  (stripePromise ??= loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY))
