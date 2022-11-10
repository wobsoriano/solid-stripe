## Link Authentication

With [Link](https://link.co/), customer’s don’t have to re-enter payment and address details for each purchase. Their details are retreived based on their e-mail address.

Once they enter their e-mail they receive an SMS code to verify their identity.

It works in conjuction with `<PaymentElement>`:

```tsx
function CheckoutForm() {
  // Check the PaymentElement README for the whole implementation sample

  return (
    <Form>
      <LinkAuthenticationElement />
      <PaymentElement />
      <button>Pay</button>
    </Form>
  )
}
```

More info https://stripe.com/docs/payments/link/accept-a-payment
