export async function createPaymentIntent(paymentIntentParams: Record<string, any>) {
  const resp = await fetch('/api/payment-intent', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(paymentIntentParams),
  })
  const { client_secret } = await resp.json()
  return client_secret as string
}
