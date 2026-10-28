import type * as stripeJs from '@stripe/stripe-js'
import { createContext, createMemo, useContext, type Accessor } from 'solid-js'
import {
  ElementsContext,
  parseElementsContext,
  type ElementsContextValue,
} from '../components/Elements'

export type CheckoutSdk = stripeJs.StripeCheckoutElementsSdk | stripeJs.StripeCheckoutFormSdk

export type CheckoutKind = 'elements' | 'form'

type ElementsLoadActionsSuccess = Extract<
  stripeJs.StripeCheckoutLoadActionsResult,
  { type: 'success' }
>['actions']

type FormLoadActionsSuccess = Extract<
  stripeJs.StripeCheckoutFormLoadActionsResult,
  { type: 'success' }
>['actions']

export type CheckoutState =
  | { type: 'loading'; sdk: CheckoutSdk | null }
  | {
      type: 'success'
      sdkKind: 'elements'
      sdk: stripeJs.StripeCheckoutElementsSdk
      checkoutActions: ElementsLoadActionsSuccess
      session: stripeJs.StripeCheckoutSession
    }
  | {
      type: 'success'
      sdkKind: 'form'
      sdk: stripeJs.StripeCheckoutFormSdk
      checkoutActions: FormLoadActionsSuccess
      session: stripeJs.StripeCheckoutSession
    }
  | { type: 'error'; error: { message: string } }

export interface CheckoutContextValue {
  /** Which provider created this context. Fixed for the provider's lifetime. */
  kind: CheckoutKind
  checkoutState: Accessor<CheckoutState>
}

export const CheckoutContext = createContext<CheckoutContextValue | null>(null)

export interface CheckoutSdkContextValue {
  stripe: Accessor<stripeJs.Stripe | null>
  checkoutSdk: Accessor<CheckoutSdk | null>
}

// Element wrappers and useStripe need SDK references, not session updates.
// A non-null value also identifies a checkout provider before initialization.
export const CheckoutSdkContext = createContext<CheckoutSdkContextValue | null>(null)

const providerNames = '<CheckoutElementsProvider> or <CheckoutFormProvider>'

export const validateCheckoutContext = (
  ctx: CheckoutContextValue | null,
  useCase: string,
): CheckoutContextValue => {
  if (!ctx) {
    throw new Error(
      `Could not find checkout context; You need to wrap the part of your app that ${useCase} in a ${providerNames} provider.`,
    )
  }
  return ctx
}

export const useElementsOrCheckoutContextWithUseCase = (
  useCaseString: string,
): CheckoutSdkContextValue | ElementsContextValue => {
  const checkout = useContext(CheckoutSdkContext)
  const elements = useContext(ElementsContext)

  if (checkout && elements) {
    throw new Error(
      `You cannot wrap the part of your app that ${useCaseString} in both a checkout provider and <Elements> provider.`,
    )
  }

  return checkout ?? parseElementsContext(elements, useCaseString)
}

type StripeCheckoutElementsActions = Omit<
  stripeJs.StripeCheckoutElementsSdk,
  'on' | 'loadActions'
> &
  Omit<ElementsLoadActionsSuccess, 'getSession'>

type StripeCheckoutFormActions = Omit<stripeJs.StripeCheckoutFormSdk, 'on' | 'loadActions'> &
  Omit<FormLoadActionsSuccess, 'getSession'>

export type StripeCheckoutElementsValue = StripeCheckoutElementsActions &
  stripeJs.StripeCheckoutSession

export type StripeCheckoutFormValue = StripeCheckoutFormActions & stripeJs.StripeCheckoutSession

/** The Elements-shaped value `useCheckout()` has always returned. */
export type StripeCheckoutValue = StripeCheckoutElementsValue

type CheckoutResult<Value> =
  | { type: 'loading' }
  | { type: 'success'; checkout: Value }
  | { type: 'error'; error: { message: string } }

export type StripeUseCheckoutElementsResult = CheckoutResult<StripeCheckoutElementsValue>

export type StripeUseCheckoutFormResult = CheckoutResult<StripeCheckoutFormValue>

export type StripeUseCheckoutResult = StripeUseCheckoutElementsResult

// One runtime shape, typed by the calling hook. Both SDK kinds expose `on` and
// `loadActions`, so the same destructure works for either.
const toCheckoutResult = <Value>(checkoutState: CheckoutState): CheckoutResult<Value> => {
  if (checkoutState.type === 'success') {
    const { sdk, session, checkoutActions } = checkoutState
    const { on: _on, loadActions: _loadActions, ...sdkMethods } = sdk
    const { getSession: _getSession, ...otherCheckoutActions } = checkoutActions
    return {
      type: 'success',
      checkout: { ...session, ...sdkMethods, ...otherCheckoutActions } as unknown as Value,
    }
  }
  if (checkoutState.type === 'loading') return { type: 'loading' }
  return { type: 'error', error: checkoutState.error }
}

const hookFor: Record<CheckoutKind, { hook: string; provider: string }> = {
  elements: { hook: 'useCheckoutElements()', provider: '<CheckoutElementsProvider>' },
  form: { hook: 'useCheckoutForm()', provider: '<CheckoutFormProvider>' },
}

const useCheckoutResult = <Value>(
  hook: string,
  requiredKind?: CheckoutKind,
): Accessor<CheckoutResult<Value>> => {
  const ctx = validateCheckoutContext(useContext(CheckoutContext), `calls ${hook}`)

  if (requiredKind && ctx.kind !== requiredKind) {
    const expected = hookFor[requiredKind]
    const actual = hookFor[ctx.kind]
    throw new Error(
      `${expected.hook} must be used inside ${expected.provider}. Inside ${actual.provider}, use ${actual.hook} instead.`,
    )
  }

  return createMemo(() => toCheckoutResult<Value>(ctx.checkoutState()))
}

/**
 * @deprecated Prefer the provider-specific hooks:
 * - Inside `<CheckoutElementsProvider>`, use `useCheckoutElements()`.
 * - Inside `<CheckoutFormProvider>`, use `useCheckoutForm()`.
 *
 * `useCheckout()` works under both providers and returns the Elements-shaped result.
 */
export const useCheckout = (): Accessor<StripeUseCheckoutResult> =>
  useCheckoutResult<StripeCheckoutElementsValue>('useCheckout()')

/**
 * Returns an accessor for the checkout session and actions of the nearest `<CheckoutElementsProvider>`.
 */
export const useCheckoutElements = (): Accessor<StripeUseCheckoutElementsResult> =>
  useCheckoutResult<StripeCheckoutElementsValue>('useCheckoutElements()', 'elements')

/**
 * Returns an accessor for the checkout session and actions of the nearest `<CheckoutFormProvider>`.
 */
export const useCheckoutForm = (): Accessor<StripeUseCheckoutFormResult> =>
  useCheckoutResult<StripeCheckoutFormValue>('useCheckoutForm()', 'form')
