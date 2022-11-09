import type { StripeElementBase, StripeElementType, StripeElementsOptions } from '@stripe/stripe-js'
import type { Accessor } from 'solid-js'
import { onCleanup, onMount } from 'solid-js'
import { useStripeElements } from 'src/Elements'

type FixMe = Record<string, any>
type NormalFn = () => StripeElementsOptions & FixMe

export function createStripeElement(
  node: HTMLElement,
  elementType: StripeElementType,
  elementsOptions: Accessor<StripeElementsOptions & FixMe> | (StripeElementsOptions & FixMe) | NormalFn = {},
  setElement?: (element: StripeElementBase) => void,
  cb?: (eventType: 'onChange' | 'onReady' | 'onFocus' | 'onBlur' | 'onEscape', ev: any) => void,
) {
  const elements = useStripeElements()

  onMount(() => {
    const newElement = elements!.create(elementType as any, typeof elementsOptions === 'function' ? elementsOptions() : elementsOptions as any)

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

  return elements
}
