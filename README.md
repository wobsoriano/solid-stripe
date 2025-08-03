<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-stripe&background=tiles&project=%20" alt="solid-stripe">
</p>

# solid-stripe

Solid components for [Stripe.js and Elements](https://stripe.com/docs/stripe-js).

> [!NOTE]
> The aim of this module is to have [`@stripe/react-stripe-js`](https://github.com/stripe/react-stripe-js) for Solid with feature parity. You should be able to follow the [React docs](https://stripe.com/docs/stripe-js/react) and examples using this module.

## Installation

```bash
npm install @stripe/stripe-js solid-stripe
```

## Minimal example

```tsx
import { createSignal } from 'solid-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from 'solid-stripe';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = createSignal(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (elements() === null) {
      return;
    }

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements().submit();
    if (submitError) {
      // Show error to your customer
      setErrorMessage(submitError.message);
      return;
    }

    // Create the PaymentIntent and obtain clientSecret from your server endpoint
    const res = await fetch('/create-intent', {
      method: 'POST',
    });
    const { client_secret: clientSecret } = await res.json();

    const { error } = await stripe().confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements: elements(),
      clientSecret,
      confirmParams: {
        return_url: 'https://example.com/order/123/complete',
      },
    });

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setErrorMessage(error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe() || !elements()}>
        Pay
      </button>
      {/* Show error message to your customers */}
      {errorMessage() && <div>{errorMessage()}</div>}
    </form>
  );
};

const options = {
  mode: 'payment',
  amount: 1099,
  currency: 'usd',
  // Fully customizable with appearance API.
  appearance: {
    /*...*/
  },
};

const App = () => {
  const stripePromise = loadStripe('pk_test_6pRNASCoBOKtIshFeQd4XMUh');

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  )
};

export default App;
```

## License

MIT
