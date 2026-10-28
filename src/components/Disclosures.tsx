import type * as stripeJs from '@stripe/stripe-js'
import { createEffect, onCleanup, type Component } from 'solid-js'
import { createStripeLoader } from '../utils/createStripeLoader'

export interface DisclosureProps<Options> {
  /**
   * A [Stripe object](https://stripe.com/docs/js/initializing) or a `Promise` resolving to a `Stripe` object.
   * The easiest way to initialize a `Stripe` object is with the the [Stripe.js wrapper module](https://github.com/stripe/stripe-js/blob/master/README.md#readme).
   * Once this prop has been set, it can not be changed.
   *
   * You can also pass in `null` or a `Promise` resolving to `null` if you are performing an initial server-side render or when generating a static site.
   */
  stripe: PromiseLike<stripeJs.Stripe | null> | stripeJs.Stripe | null

  /**
   * Called after the disclosure content loads.
   */
  onLoad?: () => void

  /**
   * Called when an error occurs during disclosure creation.
   */
  onError?: (error: stripeJs.StripeError) => void

  options?: Options
}

type DisclosureResult = { htmlElement?: HTMLElement; error?: stripeJs.StripeError }

// These Stripe.js methods are not in the published `@stripe/stripe-js` types.
type DisclosureMethod =
  | 'createIssuingDisclosure'
  | 'createFinancialAccountDisclosure'
  | 'createTreasuryDisclosure'

type DisclosureApi = Record<DisclosureMethod, (options: object) => Promise<DisclosureResult>>

const createDisclosureComponent = <Options extends object>(
  name: string,
  method: DisclosureMethod,
): Component<DisclosureProps<Options>> => {
  return props => {
    const stripe = createStripeLoader(() => props.stripe, { name })
    let container!: HTMLDivElement

    createEffect(() => {
      const instance = stripe() as unknown as DisclosureApi | null
      // Spreading tracks each option, so changing one re-creates the disclosure.
      const options = { ...props.options }
      if (!instance) return

      let stale = false
      onCleanup(() => (stale = true))

      void instance[method](options).then(({ htmlElement, error }) => {
        if (stale) return
        if (error) {
          props.onError?.(error)
        } else if (htmlElement) {
          container.replaceChildren(htmlElement)
          props.onLoad?.()
        }
      })
    })

    return <div ref={container} />
  }
}

/**
 * Renders the Stripe Issuing disclosure.
 *
 * - `issuingProgramID`: The ID of the issuing program you want to display the disclosure for.
 * - `publicCardProgramName`: The public name of the Issuing card program you want to display the disclosure for.
 * - `learnMoreLink`: A supplemental link for your users to learn more about Issuing or any other relevant information included in the disclosure.
 */
export const IssuingDisclosure = createDisclosureComponent<{
  issuingProgramID?: string
  publicCardProgramName?: string
  learnMoreLink?: string
}>('IssuingDisclosure', 'createIssuingDisclosure')

/**
 * Renders the Financial Accounts for platforms disclosure.
 *
 * - `businessName`: Your business name as it should appear in the disclosure. Inferred from the Stripe account when omitted.
 * - `learnMoreLink`: A supplemental link for your users to learn more about Financial Accounts for platforms.
 */
export const FinancialAccountDisclosure = createDisclosureComponent<{
  businessName?: string
  learnMoreLink?: string
}>('FinancialAccountDisclosure', 'createFinancialAccountDisclosure')

/**
 * Renders the Treasury disclosure.
 *
 * - `businessName`: Your business name as it should appear in the disclosure. Inferred from the Stripe account when omitted.
 * - `learnMoreLink`: A supplemental link for your users to learn more about Treasury.
 */
export const TreasuryDisclosure = createDisclosureComponent<{
  businessName?: string
  learnMoreLink?: string
}>('TreasuryDisclosure', 'createTreasuryDisclosure')
