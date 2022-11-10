import type { StripeElementType, StripeElementsOptions } from '@stripe/stripe-js'
import type { Accessor } from 'solid-js'
import { createEffect, onCleanup } from 'solid-js'
import { useStripeElements } from '../Elements'

type FixMe = Record<string, any>
type NormalFn = () => StripeElementsOptions & FixMe

export function createStripeElement(
  node: Accessor<HTMLDivElement | null>,
  elementType: StripeElementType,
  elementsOptions: Accessor<StripeElementsOptions & FixMe> | (StripeElementsOptions & FixMe) | NormalFn = {},
  cb?: (eventType: 'onChange' | 'onReady' | 'onFocus' | 'onBlur' | 'onEscape', ev: any) => void,
) {
  const elements = useStripeElements()

  createEffect(() => {
    const newElement = elements()!.create(elementType as any, typeof elementsOptions === 'function' ? elementsOptions() : elementsOptions as any)

    newElement.mount(node()!)

    newElement.on('change', e => cb?.('onChange', e))
    newElement.on('ready', e => cb?.('onReady', e))
    newElement.on('focus', e => cb?.('onFocus', e))
    newElement.on('blur', e => cb?.('onBlur', e))
    newElement.on('escape', e => cb?.('onEscape', e))

    onCleanup(() => {
      newElement.unmount()
    })
  }, { defer: true })

  return elements
}
