import * as stripeJs from '@stripe/stripe-js'
import {
  Accessor,
  Component,
  createComputed,
  createEffect,
  createSignal,
  on,
  onCleanup,
} from 'solid-js'
import { ElementProps, UnknownOptions } from '../types'
import { useElementsOrCheckoutSdkContextWithUseCase } from './CheckoutProvider'

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
    const ctx = useElementsOrCheckoutSdkContextWithUseCase(`mounts <${displayName}>`)
    const elements = 'elements' in ctx ? ctx.elements : null
    const checkoutSdk = 'checkoutSdk' in ctx ? ctx.checkoutSdk : null
    const [elementRef, setElementRef] = createSignal<stripeJs.StripeElement | null>(null)
    const [domNode, setDomNode] = createSignal<HTMLDivElement | null>(null)

    createComputed(() => {
      if (elementRef() === null && domNode() !== null && (elements?.() || checkoutSdk?.())) {
        let newElement: stripeJs.StripeElement | null = null

        if (checkoutSdk?.()) {
          switch (type) {
                      case 'payment':
                        newElement = checkoutSdk()!.createPaymentElement(props.options);
                        break;
                      case 'address':
                        if ('mode' in props.options!) {
                          const {mode, ...restOptions} = props.options;
                          if (mode === 'shipping') {
                            newElement = checkoutSdk()!.createShippingAddressElement(
                              restOptions
                            );
                          } else if (mode === 'billing') {
                            newElement = checkoutSdk()!.createBillingAddressElement(
                              restOptions
                            );
                          } else {
                            throw new Error(
                              "Invalid options.mode. mode must be 'billing' or 'shipping'."
                            );
                          }
                        } else {
                          throw new Error(
                            "You must supply options.mode. mode must be 'billing' or 'shipping'."
                          );
                        }
                        break;
                      case 'expressCheckout':
                        newElement = checkoutSdk()!.createExpressCheckoutElement(
                          props.options as any
                        ) as stripeJs.StripeExpressCheckoutElement;
                        break;
                      case 'currencySelector':
                        newElement = checkoutSdk()!.createCurrencySelectorElement();
                        break;
                      case 'taxId':
                        newElement = checkoutSdk()!.createTaxIdElement(props.options);
                        break;
                      default:
                        throw new Error(
                          `Invalid Element type ${displayName}. You must use either the <PaymentElement />, <AddressElement options={{mode: 'shipping'}} />, <AddressElement options={{mode: 'billing'}} />, or <ExpressCheckoutElement />.`
                        );
                    }
        } else if (elements?.()) {
          newElement = elements()!.create(type as any, props.options);
        }

        // Store element in state to facilitate event listener attachment
        setElementRef(newElement)

        if (newElement) {
          newElement.mount(domNode()!)
        }
      }
    })

    createEffect(
      on(
        () => props.options,
        options => {
          if (!elementRef() || !options) {
            return
          }

          elementRef()!.update(options)
        },
        {
          defer: true,
        },
      ),
    )

    useAttachEvent(elementRef, 'blur', props.onBlur)
    useAttachEvent(elementRef, 'focus', props.onFocus)
    useAttachEvent(elementRef, 'escape', props.onEscape)
    useAttachEvent(elementRef, 'click', props.onClick)
    useAttachEvent(elementRef, 'loaderror', props.onLoadError)
    useAttachEvent(elementRef, 'loaderstart', props.onLoaderStart)
    useAttachEvent(elementRef, 'networkschange', props.onNetworksChange)
    useAttachEvent(elementRef, 'confirm', props.onConfirm)
    useAttachEvent(elementRef, 'cancel', props.onCancel)
    useAttachEvent(elementRef, 'shippingaddresschange', props.onShippingAddressChange)
    useAttachEvent(elementRef, 'shippingratechange', props.onShippingRateChange)
    useAttachEvent(elementRef, 'change', props.onChange)

    let readyCallback: UnknownCallback | undefined
    if (props.onReady) {
      if (type === 'expressCheckout') {
        // Passes through the event, which includes visible PM types
        readyCallback = props.onReady
      } else {
        // For other Elements, pass through the Element itself.
        readyCallback = () => {
          props.onReady?.(elementRef())
        }
      }
    }

    useAttachEvent(elementRef, 'ready', readyCallback)

    onCleanup(() => {
      const currentElement = elementRef()
      if (currentElement && typeof currentElement.destroy === 'function') {
        try {
          currentElement.destroy()
        } catch {}
      }
    })

    return <div id={props.id} class={props.class} ref={setDomNode}></div>
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
    if (!element() || !cb) {
      return
    }

    ;(element() as any).on(event, cb)

    onCleanup(() => {
      ;(element() as any).off(event, cb)
    })
  })
}
