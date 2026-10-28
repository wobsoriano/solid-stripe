import type * as stripeJs from '@stripe/stripe-js'
import { createEffect, createMemo, createSignal, untrack, type Component } from 'solid-js'
import type { ElementProps } from '../types'
import {
  extractAllowedOptionsUpdates,
  type UnknownOptions,
} from '../utils/extractAllowedOptionsUpdates'
import { watch } from '../utils/watch'
import {
  useElementsOrCheckoutContextWithUseCase,
  type CheckoutSdk,
} from '../checkout/CheckoutContext'
import { createCheckoutElement } from '../checkout/createCheckoutElement'

type UnknownCallback = (...args: unknown[]) => unknown

/** Callback props and the Stripe element event each one listens to. */
const elementEvents = {
  onBlur: 'blur',
  onFocus: 'focus',
  onEscape: 'escape',
  onClick: 'click',
  onLoadError: 'loaderror',
  onLoaderStart: 'loaderstart',
  onNetworksChange: 'networkschange',
  onConfirm: 'confirm',
  onCancel: 'cancel',
  onShippingAddressChange: 'shippingaddresschange',
  onShippingRateChange: 'shippingratechange',
  onSavedPaymentMethodRemove: 'savedpaymentmethodremove',
  onSavedPaymentMethodUpdate: 'savedpaymentmethodupdate',
  onAvailablePaymentMethodsChange: 'availablepaymentmethodschange',
  onChange: 'change',
} as const

type PrivateElementProps = {
  id?: string
  class?: string
  options?: UnknownOptions
  onReady?: UnknownCallback
} & { [Prop in keyof typeof elementEvents]?: UnknownCallback }

/** The subset of a Stripe element this component drives. */
interface MountableElement {
  mount(domElement: HTMLElement): void
  destroy(): void
  on(event: string, handler: UnknownCallback): void
  off(event: string, handler: UnknownCallback): void
  update?: (options: UnknownOptions) => void
}

const capitalized = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const createElementComponent = (
  type: stripeJs.StripeElementType,
  customDisplayName?: string,
): Component<ElementProps> => {
  const displayName = customDisplayName ?? `${capitalized(type)}Element`
  const useCase = `mounts <${displayName}>`

  // The server renders this same component. Effects never run there, and a separate server
  // variant would create fewer owners, so the client's hydration keys would not match.
  const Element: Component<PrivateElementProps> = props => {
    const ctx = useElementsOrCheckoutContextWithUseCase(useCase)
    let domNode!: HTMLDivElement

    const [element, setElement] = createSignal<MountableElement | null>(null)

    createEffect(
      () => ('checkoutSdk' in ctx ? ctx.checkoutSdk() : ctx.elements()),
      source => {
        if (!source) {
          setElement(null)
          return
        }

        // Options are read once at creation; later changes go through `update()`.
        const options = untrack(() => props.options) ?? {}
        const instance =
          'checkoutSdk' in ctx
            ? createCheckoutElement(source as CheckoutSdk, type, displayName, options)
            : (source as stripeJs.StripeElements).create(type as any, options)
        const created = instance as unknown as MountableElement
        created.mount(domNode)
        setElement(created)

        return () => {
          try {
            created.destroy()
          } catch {
            // The Elements instance may already be gone.
          }
        }
      },
    )

    const listen = (event: string, getCallback: () => UnknownCallback | undefined) => {
      // An effect re-runs on every compute; the memo keeps a new callback from re-subscribing.
      const hasCallback = createMemo(() => !!getCallback())
      createEffect(
        () => [element(), hasCallback()] as const,
        ([current, enabled]) => {
          if (!current || !enabled) return

          // Read the callback when the event fires, so the handler always calls the latest one.
          const handler: UnknownCallback = (...args) => untrack(getCallback)?.(...args)
          current.on(event, handler)
          return () => current.off(event, handler)
        },
      )
    }

    for (const [prop, event] of Object.entries(elementEvents)) {
      listen(event, () => props[prop as keyof typeof elementEvents])
    }

    listen('ready', () => {
      const onReady = props.onReady
      if (!onReady) return undefined
      // Express Checkout passes its event (which lists the visible payment methods);
      // every other element passes the element itself.
      return type === 'expressCheckout' ? onReady : () => onReady(untrack(element))
    })

    watch(
      () => props.options,
      (options, prevOptions) => {
        const current = untrack(element)
        if (!current?.update) return

        const updates = extractAllowedOptionsUpdates(options, prevOptions, [])
        if (updates) current.update(updates)
      },
    )

    return <div id={props.id} class={props.class} ref={domNode} />
  }

  Object.assign(Element, { __elementType: type })

  return Element as Component<ElementProps>
}

export default createElementComponent
