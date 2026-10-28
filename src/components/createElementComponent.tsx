import type * as stripeJs from '@stripe/stripe-js'
import { createEffect, createMemo, onCleanup, untrack, type Component } from 'solid-js'
import { isServer } from 'solid-js/web'
import type { ElementProps } from '../types'
import {
  extractAllowedOptionsUpdates,
  type UnknownOptions,
} from '../utils/extractAllowedOptionsUpdates'
import { watch } from '../utils/watch'
import { useElementsContextWithUseCase } from './Elements'

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

  const ClientElement: Component<PrivateElementProps> = props => {
    const ctx = useElementsContextWithUseCase(useCase)
    let domNode!: HTMLDivElement

    const element = createMemo(() => {
      const elements = ctx.elements()
      if (!elements) return null

      // Options are read once at creation; later changes go through `update()`.
      const created = untrack(
        () => elements.create(type as any, props.options ?? {}) as unknown as MountableElement,
      )
      onCleanup(() => {
        try {
          created.destroy()
        } catch {
          // The Elements instance may already be gone.
        }
      })
      return created
    })

    createEffect(() => element()?.mount(domNode))

    const listen = (event: string, getCallback: () => UnknownCallback | undefined) => {
      const hasCallback = createMemo(() => !!getCallback())
      createEffect(() => {
        const current = element()
        if (!current || !hasCallback()) return

        // Read the callback when the event fires, so a new callback never re-subscribes.
        const handler: UnknownCallback = (...args) => getCallback()?.(...args)
        current.on(event, handler)
        onCleanup(() => current.off(event, handler))
      })
    }

    for (const [prop, event] of Object.entries(elementEvents)) {
      listen(event, () => props[prop as keyof typeof elementEvents])
    }

    listen('ready', () => {
      const onReady = props.onReady
      if (!onReady) return undefined
      // Express Checkout passes its event (which lists the visible payment methods);
      // every other element passes the element itself.
      return type === 'expressCheckout' ? onReady : () => onReady(element())
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

  // Only render the Element wrapper in a server environment.
  const ServerElement: Component<PrivateElementProps> = props => {
    useElementsContextWithUseCase(useCase)
    return <div id={props.id} class={props.class} />
  }

  const Element = isServer ? ServerElement : ClientElement
  Object.assign(Element, { __elementType: type })

  return Element as Component<ElementProps>
}

export default createElementComponent
