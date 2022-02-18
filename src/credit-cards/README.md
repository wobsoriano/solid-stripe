## Credit cards

Use `<CardNumber>`, `<CardExpiry>` and `<CardCvc>` components:

```tsx
import { createResource } from 'solid-js';
import server from 'solid-start/server';
import { useData } from 'solid-app-router';
import createPaymentIntent from '~/lib/create-payment-intent';
import { CardNumber, CardExpiry, CardCvc } from 'solid-stripe';

export const routeData = () => {
  const [paymentIntent] = createResource(server(createPaymentIntent));
  return paymentIntent;
};

const Payment = () => {
  const [element, setElement] = createSignal(null);
  const submit = () => {};

  return (
    <form onSubmit={submit}>
      <CardNumber element={element} setElement={setElement} />
      <CardExpiry />
      <CardCvc />
      <button>Pay</button>
    </form>
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
