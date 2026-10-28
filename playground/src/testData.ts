export interface TestValue {
  label: string
  value: string
  hint?: string
}

export const testCards: TestValue[] = [
  { label: 'Succeeds', value: '4242 4242 4242 4242', hint: 'Any future date and any CVC' },
  {
    label: 'Requires 3D Secure',
    value: '4000 0025 0000 3155',
    hint: 'Complete or fail the test authentication',
  },
  { label: 'Declined', value: '4000 0000 0000 9995', hint: 'Fails with insufficient funds' },
]

export const testIban: TestValue = {
  label: 'Succeeds',
  value: 'DE89370400440532013000',
  hint: 'Any name and email',
}
