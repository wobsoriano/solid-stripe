import { Component, createComputed, createSignal, onCleanup } from 'solid-js'
import { useEmbeddedCheckoutContext } from './EmbeddedCheckoutProvider'
import { isServer } from 'solid-js/web'

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

export const EmbeddedCheckoutClientElement: Component<EmbeddedCheckoutProps> = props => {
  const ctx = useEmbeddedCheckoutContext()
  const [domNode, setDomNode] = createSignal<HTMLDivElement | null>(null)
  const [isMounted, setIsMounted] = createSignal(false)

  createComputed(() => {
    if (!isMounted() && ctx().embeddedCheckout && domNode() !== null) {
      ctx().embeddedCheckout!.mount(domNode()!)
      setIsMounted(true)
    }

    onCleanup(() => {
      const { embeddedCheckout } = ctx()
      if (isMounted() && embeddedCheckout) {
        try {
          embeddedCheckout.unmount()
          setIsMounted(false)
        } catch (error) {
          // Do nothing.
          // Parent effects are destroyed before child effects, so
          // in cases where both the EmbeddedCheckoutProvider and
          // the EmbeddedCheckout component are removed at the same
          // time, the embeddedCheckout instance will be destroyed,
          // which causes an error when calling unmount.
        }
      }
    })
  })

  return <div ref={setDomNode} id={props.id} class={props.class}></div>
}

// Only render the wrapper in a server environment.
const EmbeddedCheckoutServerElement = (props: EmbeddedCheckoutProps) => {
  // Validate that we are in the right context by calling useEmbeddedCheckoutContext.
  useEmbeddedCheckoutContext();
  return <div id={props.id} class={props.class} />;
};

export const EmbeddedCheckout = isServer
  ? EmbeddedCheckoutServerElement
  : EmbeddedCheckoutClientElement;