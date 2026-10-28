import Stripe from 'stripe'

let client: Stripe | undefined

// Created on first use, so pages still render when the secret key is not configured.
export const getStripe = () => (client ??= new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY))
