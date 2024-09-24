import { StripeElement, StripeElementType } from '@stripe/stripe-js'
import { Component, createComputed, createEffect, createSignal, onCleanup } from 'solid-js'
import { ElementProps, UnknownOptions } from 'src/types'
import { useElements } from './Elements'

type UnknownCallback = (...args: unknown[]) => any

interface PrivateElementProps {
  id?: string
  class?: string
  onChange?: UnknownCallback
  onBlur?: UnknownCallback
  onFocus?: UnknownCallback
  onEscape?: UnknownCallback
  onReady?: UnknownCallback
  onClick?: UnknownCallback
  onLoadError?: UnknownCallback
  onLoaderStart?: UnknownCallback
  onNetworksChange?: UnknownCallback
  onConfirm?: UnknownCallback
  onCancel?: UnknownCallback
  onShippingAddressChange?: UnknownCallback
  onShippingRateChange?: UnknownCallback
  options?: UnknownOptions
}

export const createElementComponent = ({
  type,
}: {
  type: StripeElementType
}): Component<ElementProps> => {
  const Element: Component<PrivateElementProps> = props => {
    const elements = useElements()
    const [element, setElement] = createSignal<StripeElement | null>(null)
    const [domNode, setDomNode] = createSignal<HTMLDivElement | null>(null)

    createComputed(() => {
      if (!domNode()) {
        return
      }

      const newElement = elements()!.create(type as any, props.options)
      setElement(newElement)
      newElement.mount(domNode()!)

      onCleanup(() => newElement.unmount())
    })

    useAttachEvent(element(), 'blur', props.onBlur)
    useAttachEvent(element(), 'focus', props.onFocus)
    useAttachEvent(element(), 'escape', props.onEscape)
    useAttachEvent(element(), 'click', props.onClick)
    useAttachEvent(element(), 'loaderror', props.onLoadError)
    useAttachEvent(element(), 'loaderstart', props.onLoaderStart)
    useAttachEvent(element(), 'networkschange', props.onNetworksChange)
    useAttachEvent(element(), 'confirm', props.onConfirm)
    useAttachEvent(element(), 'cancel', props.onCancel)
    useAttachEvent(element(), 'shippingaddresschange', props.onShippingAddressChange)
    useAttachEvent(element(), 'shippingratechange', props.onShippingRateChange)
    useAttachEvent(element(), 'change', props.onChange)
    useAttachEvent(element(), 'ready', props.onReady)

    return <div id={props.id} class={props.class} ref={setDomNode}></div>
  }

  ;(Element as any).__elementType = type

  return Element as Component<ElementProps>
}

export const useAttachEvent = <A extends unknown[]>(
  element: StripeElement | null,
  event: string,
  cb?: (...args: A) => any,
) => {
  createEffect(() => {
    if (!element) {
      return
    }

    ;(element as any).on(event, cb)

    onCleanup(() => {
      ;(element as any).off(event, cb)
    })
  })
}
