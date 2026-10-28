import type * as stripeJs from '@stripe/stripe-js'
import {
  createContext,
  createMemo,
  untrack,
  useContext,
  type Accessor,
  type Component,
  type JSX,
  type ParentComponent,
} from 'solid-js'
import { createStripeLoader } from '../utils/createStripeLoader'
import { watch } from '../utils/watch'
import { extractAllowedOptionsUpdates } from '../utils/extractAllowedOptionsUpdates'

export interface ElementsContextValue {
  elements: Accessor<stripeJs.StripeElements | null>
  stripe: Accessor<stripeJs.Stripe | null>
}

export const ElementsContext = createContext<ElementsContextValue | null>(null)

export const parseElementsContext = (
  ctx: ElementsContextValue | null,
  useCase: string,
): ElementsContextValue => {
  if (!ctx) {
    throw new Error(
      `Could not find Elements context; You need to wrap the part of your app that ${useCase} in an <Elements> provider.`,
    )
  }

  return ctx
}

export interface ElementsProps {
  /**
   * A [Stripe object](https://stripe.com/docs/js/initializing) or a `Promise` resolving to a `Stripe` object.
   * The easiest way to initialize a `Stripe` object is with the the [Stripe.js wrapper module](https://github.com/stripe/stripe-js/blob/master/README.md#readme).
   * Once this prop has been set, it can not be changed.
   *
   * You can also pass in `null` or a `Promise` resolving to `null` if you are performing an initial server-side render or when generating a static site.
   */
  stripe: PromiseLike<stripeJs.Stripe | null> | stripeJs.Stripe | null

  /**
   * Optional [Elements configuration options](https://stripe.com/docs/js/elements_object/create).
   * `clientSecret` and `fonts` are read once, when the Elements instance is created.
   * Changes to other options are applied with `elements.update()`.
   */
  options?: stripeJs.StripeElementsOptions
}

/**
 * The `Elements` provider allows you to use [Element components](https://stripe.com/docs/stripe-js/react#element-components) and access the [Stripe object](https://stripe.com/docs/js/initializing) in any nested component.
 * Render an `Elements` provider at the root of your app so that it is available everywhere you need it.
 *
 * To use the `Elements` provider, call `loadStripe` from `@stripe/stripe-js` with your publishable key.
 * The `loadStripe` function will asynchronously load the Stripe.js script and initialize a `Stripe` object.
 * Pass the returned `Promise` to `Elements`.
 */
export const Elements: ParentComponent<ElementsProps> = props => {
  const stripe = createStripeLoader(() => props.stripe, { name: 'Elements' })

  const elements = createMemo(() => {
    const instance = stripe()
    // `stripe.elements()` options are only read at creation; later changes go through `update()`.
    return instance ? untrack(() => instance.elements(props.options as any)) : null
  })

  watch(
    () => props.options,
    (options, prevOptions) => {
      const instance = untrack(elements)
      if (!instance) return

      const updates = extractAllowedOptionsUpdates(options, prevOptions, ['clientSecret', 'fonts'])
      if (updates) void instance.update(updates)
    },
  )

  return (
    <ElementsContext.Provider value={{ stripe, elements }}>
      {props.children}
    </ElementsContext.Provider>
  )
}

export const useElementsContextWithUseCase = (useCaseMessage: string): ElementsContextValue => {
  return parseElementsContext(useContext(ElementsContext), useCaseMessage)
}

/**
 * Returns an accessor for the [Elements](https://stripe.com/docs/js/elements_object) instance
 * created by the nearest `<Elements>` provider. It is `null` until Stripe has loaded.
 */
export const useElements = (): Accessor<stripeJs.StripeElements | null> => {
  return useElementsContextWithUseCase('calls useElements()').elements
}

interface ElementsConsumerProps {
  children: (ctx: ElementsContextValue) => JSX.Element
}

/**
 * Render-prop access to the `<Elements>` context, for code that cannot call `useElements()`.
 */
export const ElementsConsumer: Component<ElementsConsumerProps> = props => {
  const ctx = useElementsContextWithUseCase('mounts <ElementsConsumer>')
  return untrack(() => props.children(ctx))
}
