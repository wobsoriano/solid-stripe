import { loadStripe, Stripe } from "@stripe/stripe-js";
import { createSignal, onMount, Show } from "solid-js";
import { StripeProvider } from 'solid-stripe'

export default function PaymentElement() {
  const [stripe, setStripe] = createSignal<Stripe | null>(null);

  onMount(async () => {
    const result = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    setStripe(result);
  })
  
  return (
    <main>
       <Show when={stripe()} fallback={<div>Loading stripe...</div>}>
        <StripeProvider stripe={stripe()} />
      </Show>
    </main>
  );
}
