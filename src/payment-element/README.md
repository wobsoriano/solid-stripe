## Payment Element

The latest component from Stripe lets you accept up to [18+ payment methods](https://stripe.com/docs/payments/payment-methods/integration-options) with a single integration.

To use it, use the `<PaymentElement>` component:

```tsx
import { createResource, Show } from 'solid-js';
import server from 'solid-start/server';
import { useRouteData } from 'solid-app-router';
import createPaymentIntent from '~/lib/create-payment-intent';
import { PaymentElement, useStripe } from 'solid-stripe';

export const routeData = () => {
  const [paymentIntent] = createResource(server(createPaymentIntent));
  return paymentIntent;
};

const Payment = () => {
  const paymentIntent = useRouteData();
  const stripe = useStripe();
  const [elements, setElements] = createSignal(null);

  const submit = async () => {
    // Pass the elements instance to `stripe.confirmPayment()`
    const result = await stripe.confirmPayment({
      elements: elements(),
      // specify redirect: 'if_required' or a `return_url`
      redirect: 'if_required',
    });
  };

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
  );
};
```

When creating the payment intent, enable the automatic_payment_methods: option:

```ts
stripe.paymentIntents.create({
  amount: 1069,
  currency: 'eur',
  automatic_payment_methods: { enabled: true },
});
```

More info https://stripe.com/docs/payments/payment-element
