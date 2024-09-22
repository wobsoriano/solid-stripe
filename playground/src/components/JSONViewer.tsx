import '@alenaksu/json-viewer'
import { onMount } from 'solid-js'

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'json-viewer': unknown
    }
  }
}

export default function JSONViewer(props: { data: Record<string, any> }) {
  let viewer: HTMLElement

  onMount(() => {
    // @ts-expect-error: TODO: fix typings
    viewer?.expandAll()
  })

  return <json-viewer ref={viewer!}>{JSON.stringify(props.data)}</json-viewer>
}
