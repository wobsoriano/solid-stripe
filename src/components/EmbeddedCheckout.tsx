import { isServer } from '@solidjs/web'
import { createEffect, type Component } from 'solid-js'
import { useEmbeddedCheckoutContext } from './EmbeddedCheckoutProvider'

interface EmbeddedCheckoutProps {
  /**
   * Passes through to the Embedded Checkout container.
   */
  id?: string

  /**
   * Passes through to the Embedded Checkout container.
   */
  class?: string
}

const EmbeddedCheckoutClientElement: Component<EmbeddedCheckoutProps> = props => {
  const ctx = useEmbeddedCheckoutContext()
  let domNode!: HTMLDivElement

  createEffect(ctx.embeddedCheckout, embeddedCheckout => {
    if (!embeddedCheckout) return

    embeddedCheckout.mount(domNode)
    return () => {
      try {
        embeddedCheckout.unmount()
      } catch {
        // When the provider and this component unmount together, the provider
        // destroys the embedded checkout first and `unmount()` throws.
      }
    }
  })

  return <div ref={domNode} id={props.id} class={props.class} />
}

// Only render the wrapper in a server environment.
const EmbeddedCheckoutServerElement: Component<EmbeddedCheckoutProps> = props => {
  // Validate that we are in the right context by calling useEmbeddedCheckoutContext.
  useEmbeddedCheckoutContext()
  return <div id={props.id} class={props.class} />
}

export const EmbeddedCheckout: Component<EmbeddedCheckoutProps> = isServer
  ? EmbeddedCheckoutServerElement
  : EmbeddedCheckoutClientElement
