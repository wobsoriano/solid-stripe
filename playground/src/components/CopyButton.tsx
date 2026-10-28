import { createSignal, onSettled } from 'solid-js'

export default function CopyButton(props: { text: string; label: string }) {
  const [copied, setCopied] = createSignal(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  onSettled(() => () => clearTimeout(timer))

  const copy = async () => {
    await navigator.clipboard.writeText(props.text)
    setCopied(true)
    clearTimeout(timer)
    timer = setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      class="copy-button"
      aria-label={copied() ? 'Copied' : props.label}
      onClick={copy}
    >
      {copied() ? 'Copied' : 'Copy'}
    </button>
  )
}
