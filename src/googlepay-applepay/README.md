## Google Pay and Apple Pay

Display a Google Pay or Apple Pay button using the `<PaymentRequestButton />` component.

```tsx
import { Show, createResource } from 'solid-js'
import server from 'solid-start/server'
import { useRouteData } from 'solid-app-router'
import { PaymentRequestButton } from 'solid-stripe'
import createPaymentIntent from '~/lib/create-payment-intent'

export const routeData = () => {
  const [paymentIntent] = createResource(server(createPaymentIntent))
  return paymentIntent
}

const Payment = () => {
  const paymentIntent = useRouteData()
  const stripe = useStripe()

  const pay = async (ev) => {
    const confirmResult = await stripe.confirmCardPayment(paymentIntent().client_secret, {
      payment_method: ev.paymentMethod,
    })

    if (confirmResult.error) {
      // Report to the browser that the payment failed, prompting it to
      // re-show the payment interface, or show an error message and close
      // the payment interface.
      ev.complete('fail')
    }
    else {
      // Report to the browser that the confirmation was successful, prompting
      // it to close the browser payment method collection interface.
      ev.complete('success')
    }
  }

  const paymentRequest = {
    country: 'US',
    currency: 'usd',
    total: { label: 'Demo total', amount: 1099 },
    requestPayerName: true,
    requestPayerEmail: true,
  }

  return (
    <Show when={paymentIntent()}>
      <PaymentRequestButton paymentRequest={paymentRequest} onPaymentMethod={pay} />
    </Show>
  )
}
```

More info https://stripe.com/docs/stripe-js/elements/payment-request-button
