import Stripe from 'stripe'

export const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {} as any)
