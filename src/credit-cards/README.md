## Credit cards

Use `<CardNumber>`, `<CardExpiry>` and `<CardCvc>` components:

```tsx
import { createResource, Show } from 'solid-js';
import server from 'solid-start/server';
import { useRouteData } from 'solid-app-router';
import createPaymentIntent from '~/lib/create-payment-intent';
import { CardNumber, CardExpiry, CardCvc } from 'solid-stripe';

export const routeData = () => {
  const [paymentIntent] = createResource(server(createPaymentIntent));
  return paymentIntent;
};

const Payment = () => {
  const paymentIntent = useRouteData();
  const [element, setElement] = createSignal(null);
  const submit = () => {};

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

When the form submits, pass the element to `stripe.confirmCardPayment()`:

```ts
import { useStripe } from 'solid-start';

const stripe = useStripe();

const submit = async () => {
  const result = await stripe.confirmCardPayment(paymentIntent().client_secret, {
    payment_method: {
      card: element(),
      billing_details: {...},
    },
  });
};
```
