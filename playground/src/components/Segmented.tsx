import { For } from 'solid-js'

interface Props<T extends string> {
  legend: string
  name: string
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

export default function Segmented<T extends string>(props: Props<T>) {
  return (
    <fieldset class="control">
      <legend>{props.legend}</legend>
      <div class="segmented">
        <For each={props.options}>
          {option => (
            <label>
              <input
                type="radio"
                name={props.name}
                value={option.value}
                checked={props.value === option.value}
                onChange={() => props.onChange(option.value)}
              />
              {option.label}
            </label>
          )}
        </For>
      </div>
    </fieldset>
  )
}
