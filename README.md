<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-stripe&background=tiles&project=%20" alt="solid-stripe">
</p>

# solid-stripe

Solid components for [Stripe.js and Elements](https://stripe.com/docs/payments/elements).

## Installation

To configure your project add these packages:

```bash
pnpm add @stripe/stripe-js solid-stripe
```

In your server-side app, add the official server-side/node version of Stripe too:

```bash
pnpm add stripe
```

We'll use [solid-start](https://github.com/solidjs/solid-start) in all of the examples.

## Docs

### Set up Stripe

Add your private and public keys to your environment:

```
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_STRIPE_SECRET_KEY=sk_test_...
```

In your payment page, initialize Stripe and add a `<Elements />` component:

```tsx
import { Show, createSignal, onMount } from 'solid-js'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from 'solid-stripe'

export function MyPaymentComponent() {
  const [stripe, setStripe] = createSignal(null)

  onMount(async () => {
    const result = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    setStripe(result)
  })

  return (
    <Show when={stripe()} fallback={<div>Loading stripe</div>}>
      <Elements stripe={stripe()}>
        {/* this is where your Stripe components go */}
      </Elements>
    </Show>
  )
}
```

### Creating a payment intent

Before making a charge, Stripe should be notified by creating a [payment intent](https://stripe.com/docs/api/payment_intents). It’s a way to tell Stripe what amount to capture and to attach any relavent metadata, for example, the products they are buying. This must happen server-side to avoid anyone tampering with the amount.

Let's add an endpoint `src/routes/api/create-payment-intent.ts` to create the "payment intent":

```ts
import { json } from 'solid-start'
import Stripe from 'stripe'

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY)

export async function POST() {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 69420,
    // note, for some EU-only payment methods it must be EUR
    currency: 'usd',
    // specify what payment methods are allowed
    // can be card, sepa_debit, ideal, etc...
    payment_method_types: ['card'],
  })

  // return the clientSecret to the client
  return json({
    clientSecret: paymentIntent.client_secret
  })
}
```

### Accepting payments

There are several types of payment you can accept:

- [Payment Element](https://github.com/wobsoriano/solid-stripe/tree/main/src/payment-element)
- [Link Authentication](https://github.com/wobsoriano/solid-stripe/tree/main/src/link-authentication)
- [Credit Cards](https://github.com/wobsoriano/solid-stripe/tree/main/src/credit-cards)
- [Google Pay and Apple Pay](https://github.com/wobsoriano/solid-stripe/tree/main/src/googlepay-applepay)
- [SEPA](https://github.com/wobsoriano/solid-stripe/tree/main/src/sepa)
- [iDEAL](https://github.com/wobsoriano/solid-stripe/tree/main/src/ideal)

Inspired by [svelte-stripe](https://www.sveltestripe.com/) and [react-stripe](https://github.com/stripe/react-stripe-js).

## License

MIT
