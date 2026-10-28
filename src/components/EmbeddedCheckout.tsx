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

// The server renders this same component, so its hydration keys match the client's.
export const EmbeddedCheckout: Component<EmbeddedCheckoutProps> = props => {
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
