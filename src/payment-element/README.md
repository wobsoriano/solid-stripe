## Payment Element

The latest component from Stripe lets you accept up to [18+ payment methods](https://stripe.com/docs/payments/payment-methods/integration-options) with a single integration.

To use it, drop a `<PaymentElement>` component in your form:

```tsx
import { Show, createResource } from 'solid-js'
import { createServerData } from 'solid-start/server'
import { useRouteData } from 'solid-start'
import { Element, PaymentElement, useStripe } from 'solid-stripe'
import createPaymentIntent from '~/lib/create-payment-intent'

export function routeData() {
  return createServerData$(() => createPaymentIntent())
}

const Payment = () => {
  const paymentIntent = useRouteData<typeof routeData>()
  const [element, setElement] = createSignal(null)

  const stripe = useStripe()

  const [_, { Form }] = createRouteAction(async () => {
    const result = await stripe.confirmCardPayment(paymentIntent().client_secret, {
      payment_method: {
        card: element(),
        billing_details: {},
      },
    })
  })

  return (
    <Form>
      <Elements clientSecret="" onCreateElement={setElement}>
        <PaymentElement />
      </Elements>
      <button>Pay</button>
    </Form>
  )
}
```

```tsx
import { Show, createResource } from 'solid-js'
import server from 'solid-start/server'
import { useRouteData } from 'solid-app-router'
import { PaymentElement, useStripe } from 'solid-stripe'
import createPaymentIntent from '~/lib/create-payment-intent'

export const routeData = () => {
  const [paymentIntent] = createResource(server(createPaymentIntent))
  return paymentIntent
}

const Payment = () => {
  const paymentIntent = useRouteData()
  const stripe = useStripe()
  const [elements, setElements] = createSignal(null)

  const submit = async () => {
    // Pass the elements instance to `stripe.confirmPayment()`
    const result = await stripe.confirmPayment({
      elements: elements(),
      // specify redirect: 'if_required' or a `return_url`
      redirect: 'if_required',
    })
  }

  return (
    <Show when={paymentIntent()}>
      <form onSubmit={submit}>
        <PaymentElement
          elements={elements()}
          setElements={setElements}
          clientSecret={paymentIntent().client_secret}
        />
        <button>Pay</button>
      </form>
    </Show>
  )
}
```

When creating the payment intent, enable the automatic_payment_methods: option:

```ts
stripe.paymentIntents.create({
  amount: 1069,
  currency: 'eur',
  automatic_payment_methods: { enabled: true },
})
```

More info https://stripe.com/docs/payments/payment-element
