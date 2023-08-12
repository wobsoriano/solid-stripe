## Link Authentication

With [Link](https://link.co/), customer’s don’t have to re-enter payment and address details for each purchase. Their details are retreived based on their e-mail address.

Once they enter their e-mail they receive an SMS code to verify their identity.

It works in conjuction with `<PaymentElement>`:

```tsx
function CheckoutForm() {
  // Check the PaymentElement README for the complete docs

  return (
    <Form>
      <LinkAuthenticationElement />
      <PaymentElement />
      <button>Pay</button>
    </Form>
  )
}
```

[Code Example](https://github.com/wobsoriano/solid-stripe/blob/main/playground/src/routes/payment-element.tsx)
