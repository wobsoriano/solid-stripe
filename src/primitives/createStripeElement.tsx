import type { StripeElementType, StripeElementsOptions } from '@stripe/stripe-js'
import type { Accessor } from 'solid-js'
import { createEffect, onCleanup } from 'solid-js'
import { useStripeElements } from '../Elements'

type FixMe = Record<string, any>
type NormalFn = () => StripeElementsOptions & FixMe

type MaybeAccessor<T> = T | Accessor<T>
type MaybeAccessorValue<T extends MaybeAccessor<any>> = T extends () => any
  ? ReturnType<T>
  : T
function access<T extends MaybeAccessor<any>>(v: T): MaybeAccessorValue<T> {
  return typeof v === 'function' && !v.length ? v() : v
}

export function createStripeElement(
  node: MaybeAccessor<HTMLDivElement | null>,
  elementType: StripeElementType,
  elementsOptions: MaybeAccessor<StripeElementsOptions & FixMe> | NormalFn = {},
  cb?: (eventType: 'onChange' | 'onReady' | 'onFocus' | 'onBlur' | 'onEscape', ev: any) => void,
) {
  const elements = useStripeElements()

  createEffect(() => {
    const newElement = elements()!.create(elementType as any, access(elementsOptions) as any)

    newElement.mount(access(node) as HTMLDivElement)

    newElement.on('change', e => cb?.('onChange', e))
    newElement.on('ready', e => cb?.('onReady', e))
    newElement.on('focus', e => cb?.('onFocus', e))
    newElement.on('blur', e => cb?.('onBlur', e))
    newElement.on('escape', e => cb?.('onEscape', e))

    onCleanup(() => newElement.unmount())
  }, { defer: true })

  return elements
}
