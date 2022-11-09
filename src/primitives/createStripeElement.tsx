import type { StripeElementBase, StripeElementType, StripeElementsOptions } from '@stripe/stripe-js'
import { onCleanup, onMount } from 'solid-js'
import { useStripeElements } from '../StripeProvider'

export function createStripeElement(
  node: HTMLElement,
  elementType: StripeElementType,
  elementsOptions: StripeElementsOptions & Record<string, any> = {},
  setElement?: (element: StripeElementBase) => void,
  cb?: (eventType: 'onChange' | 'onReady' | 'onFocus' | 'onBlur' | 'onEscape', ev: any) => void,
) {
  const elements = useStripeElements()

  onMount(() => {
    const newElement = elements!.create(elementType as any, elementsOptions as any)

    setElement?.(newElement)

    newElement.mount(node)

    newElement.on('change', e => cb?.('onChange', e))
    newElement.on('ready', e => cb?.('onReady', e))
    newElement.on('focus', e => cb?.('onFocus', e))
    newElement.on('blur', e => cb?.('onBlur', e))
    newElement.on('escape', e => cb?.('onEscape', e))

    onCleanup(() => {
      newElement.unmount()
    })
  })
}
