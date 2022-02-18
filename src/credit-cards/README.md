## Credit cards

Use `<CardNumber>`, `<CardExpiry>` and `<CardCvc>` components:

```tsx
import { createResource, Show } from 'solid-js';
import server from 'solid-start/server';
import { useRouteData } from 'solid-app-router';
import createPaymentIntent from '~/lib/create-payment-intent';
import { CardNumber, CardExpiry, CardCvc, useStripe } from 'solid-stripe';

export const routeData = () => {
  const [paymentIntent] = createResource(server(createPaymentIntent));
  return paymentIntent;
};

const Payment = () => {
  const paymentIntent = useRouteData();
  const stripe = useStripe();
  const [element, setElement] = createSignal(null);

  const submit = async () => {
    // Pass the element to stripe.confirmCardPayment()
    const result = await stripe.confirmCardPayment(paymentIntent().client_secret, {
      payment_method: {
        card: element(),
        billing_details: {...},
      },
    });
  };

  return (
    <Show when={paymentIntent()}>
      <form onSubmit={submit}>
        <CardNumber element={element} setElement={setElement} />
        <CardExpiry />
        <CardCvc />
        <button>Pay</button>
      </form>
    </Show>
  );
};
```
