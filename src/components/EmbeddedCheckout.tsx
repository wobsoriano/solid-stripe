import { Component, createComputed, createSignal, onCleanup } from 'solid-js'
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

export const EmbeddedCheckoutClientElement: Component<EmbeddedCheckoutProps> = props => {
  const ctx = useEmbeddedCheckoutContext()
  const [domNode, setDomNode] = createSignal<HTMLDivElement | null>(null)
  const [isMounted, setIsMounted] = createSignal(false)

  createComputed(() => {
    if (!isMounted() && ctx().embeddedCheckout && domNode() !== null) {
      setIsMounted(true)
      ctx().embeddedCheckout!.mount(domNode()!)
    }

    onCleanup(() => {
      ctx().embeddedCheckout?.unmount()
      setIsMounted(false)
    })
  })

  return <div ref={setDomNode} id={props.id} class={props.class}></div>
}
