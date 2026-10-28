interface Props {
  label: string
  value: number
  min: number
  max: number
  disabled?: boolean
  onChange: (value: number) => void
}

export default function Stepper(props: Props) {
  return (
    <div class="stepper" role="group" aria-label={props.label}>
      <button
        type="button"
        aria-label={`Decrease ${props.label.toLowerCase()}`}
        disabled={props.disabled || props.value <= props.min}
        onClick={() => props.onChange(props.value - 1)}
      >
        −
      </button>
      <output aria-live="polite">{props.value}</output>
      <button
        type="button"
        aria-label={`Increase ${props.label.toLowerCase()}`}
        disabled={props.disabled || props.value >= props.max}
        onClick={() => props.onChange(props.value + 1)}
      >
        +
      </button>
    </div>
  )
}
