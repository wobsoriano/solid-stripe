import * as stripeJs from '@stripe/stripe-js'
import { Accessor, Component, createComputed, createEffect, createSignal, on, onCleanup } from 'solid-js'
import { ElementProps, UnknownOptions } from 'src/types'
import { useElementsOrCustomCheckoutSdkContextWithUseCase } from './CustomCheckout'

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

const capitalized = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export const createElementComponent = ({
  type,
}: {
  type: stripeJs.StripeElementType
}): Component<ElementProps> => {
  const displayName = `${capitalized(type)}Element`

  const Element: Component<PrivateElementProps> = props => {
    const ctx = useElementsOrCustomCheckoutSdkContextWithUseCase(`mounts <${displayName}>`)
    const elements = 'elements' in ctx ? ctx.elements : null
    const customCheckoutSdk = 'customCheckoutSdk' in ctx ? ctx.customCheckoutSdk : null
    const [element, setElement] = createSignal<stripeJs.StripeElement | null>(null)
    const [domRef, setDomRef] = createSignal<HTMLDivElement | null>(null)

    createComputed(() => {
      if (element() === null && domRef() !== null && (elements?.() || customCheckoutSdk?.())) {
        let newElement: stripeJs.StripeElement | null = null
        if (customCheckoutSdk?.()) {
          newElement = customCheckoutSdk()!.createElement(type as any, props.options)
        } else if (elements?.()) {
          newElement = elements()!.create(type as any, props.options)
        }

        setElement(newElement)

        if (newElement) {
          newElement.mount(domRef()!)
        }
      }
    })

    createEffect(
      on(
        () => props.options,
        options => {
          if (!element() || !options) {
            return
          }

          element()!.update(options)
        },
        {
          defer: true,
        },
      ),
    )

    useAttachEvent(element, 'blur', props.onBlur)
    useAttachEvent(element, 'focus', props.onFocus)
    useAttachEvent(element, 'escape', props.onEscape)
    useAttachEvent(element, 'click', props.onClick)
    useAttachEvent(element, 'loaderror', props.onLoadError)
    useAttachEvent(element, 'loaderstart', props.onLoaderStart)
    useAttachEvent(element, 'networkschange', props.onNetworksChange)
    useAttachEvent(element, 'confirm', props.onConfirm)
    useAttachEvent(element, 'cancel', props.onCancel)
    useAttachEvent(element, 'shippingaddresschange', props.onShippingAddressChange)
    useAttachEvent(element, 'shippingratechange', props.onShippingRateChange)
    useAttachEvent(element, 'change', props.onChange)

    let readyCallback: UnknownCallback | undefined
    if (props.onReady) {
      if (type === 'expressCheckout') {
        // Passes through the event, which includes visible PM types
        readyCallback = props.onReady
      } else {
        // For other Elements, pass through the Element itself.
        readyCallback = () => {
          props.onReady?.(element())
        }
      }
    }

    useAttachEvent(element, 'ready', readyCallback)

    return <div id={props.id} class={props.class} ref={setDomRef}></div>
  }

  ;(Element as any).__elementType = type

  return Element as Component<ElementProps>
}

export const useAttachEvent = <A extends unknown[]>(
  element: Accessor<stripeJs.StripeElement | null>,
  event: string,
  cb?: (...args: A) => any,
) => {
  createEffect(() => {
    if (!element() && !cb) {
      return
    }

    ;(element() as any).on(event, cb)

    onCleanup(() => {
      ;(element() as any).off(event, cb)
    })
  })
}
