## Credit cards

Use `<CardNumber>`, `<CardExpiry>` and `<CardCvc>` components:

```tsx
import { Show, createResource } from 'solid-js'
import { createServerData } from 'solid-start/server'
import { useRouteData } from 'solid-start'
import { CardCvc, CardExpiry, CardNumber, Elements, useStripe } from 'solid-stripe'
import { StripeLoader } from '~/components/StripeLoader'
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
      <CardNumber onCreateElement={setElement} />
      <CardExpiry />
      <CardCvc />
      <button>Pay</button>
    </Form>
  )
}
```
