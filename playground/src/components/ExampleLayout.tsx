import { Title } from '@solidjs/meta'
import { createResource, createSignal, For, Show, Suspense, type JSX } from 'solid-js'
import { getExample, type ExampleSlug } from '~/examples'
import { createEventLog, EventLogContext, type LoggedEvent } from '~/lib/eventLog'
import type { TestValue } from '~/testData'
import CopyButton from './CopyButton'

const routeSources = import.meta.glob<string>('../routes/*.tsx', {
  query: '?raw',
  import: 'default',
})

interface Props {
  slug: ExampleSlug
  testData?: TestValue[]
  testNotes?: JSX.Element
  note?: JSX.Element
  children: JSX.Element
}

type Tab = 'events' | 'code'

export default function ExampleLayout(props: Props) {
  const example = () => getExample(props.slug)
  const eventLog = createEventLog()
  const [tab, setTab] = createSignal<Tab>('events')
  const [source] = createResource(
    () => tab() === 'code' && props.slug,
    slug => routeSources[`../routes/${slug}.tsx`]!(),
  )

  return (
    <EventLogContext.Provider value={eventLog}>
      <Title>{`${example().title} · solid-stripe`}</Title>
      <header class="page-header">
        <p class="eyebrow">{example().group}</p>
        <h1 class="page-title">{example().title}</h1>
        <p class="page-summary">{example().summary}</p>
        <ul class="chips" aria-label="Components used">
          <For each={example().components}>{name => <li class="chip">{name}</li>}</For>
        </ul>
        <Show when={props.note}>
          <div class="callout">{props.note}</div>
        </Show>
      </header>

      <div class="example-grid">
        <div class="example-main">
          <section class="card" aria-label="Live demo">
            <Show when={import.meta.env.VITE_STRIPE_PUBLIC_KEY} fallback={<SetupCallout />}>
              {props.children}
            </Show>
          </section>
          <Show when={props.testData || props.testNotes}>
            <section class="card">
              <h2 class="card-title">Test data</h2>
              <Show when={props.testData}>{values => <TestDataList values={values()} />}</Show>
              <Show when={props.testNotes}>
                <p class="test-data-notes">{props.testNotes}</p>
              </Show>
            </section>
          </Show>
        </div>

        <section class="panel">
          <div class="panel-bar">
            <div class="tabs" role="tablist" aria-label="Inspector">
              <button
                type="button"
                role="tab"
                class="tab"
                aria-selected={tab() === 'events'}
                aria-controls="panel-events"
                onClick={() => setTab('events')}
              >
                Events
                <Show when={eventLog.events().length}>
                  {count => <span class="tab-count">{count()}</span>}
                </Show>
              </button>
              <button
                type="button"
                role="tab"
                class="tab"
                aria-selected={tab() === 'code'}
                aria-controls="panel-code"
                onClick={() => setTab('code')}
              >
                Code
              </button>
            </div>
            <Show
              when={tab() === 'code'}
              fallback={
                <button type="button" class="button-quiet" onClick={() => eventLog.clear()}>
                  Clear
                </button>
              }
            >
              <Show when={source()}>
                {text => <CopyButton text={text()} label="Copy source" />}
              </Show>
            </Show>
          </div>
          <Show
            when={tab() === 'code'}
            fallback={<EventList id="panel-events" events={eventLog.events()} />}
          >
            <div id="panel-code" role="tabpanel" class="panel-body">
              <Suspense fallback={<p class="panel-empty">Loading source…</p>}>
                <pre class="code">
                  <code>{source()}</code>
                </pre>
              </Suspense>
            </div>
          </Show>
        </section>
      </div>
    </EventLogContext.Provider>
  )
}

function SetupCallout() {
  return (
    <div class="callout callout-warning">
      <p>
        <strong>Add Stripe test keys to run this example.</strong>
      </p>
      <ol>
        <li>
          Copy <code>playground/.env.example</code> to <code>playground/.env</code>.
        </li>
        <li>
          Set <code>VITE_STRIPE_PUBLIC_KEY</code> and <code>VITE_STRIPE_SECRET_KEY</code> to the
          test keys from the{' '}
          <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noreferrer">
            Stripe Dashboard
          </a>
          .
        </li>
        <li>Restart the dev server.</li>
      </ol>
    </div>
  )
}

function TestDataList(props: { values: TestValue[] }) {
  return (
    <ul class="test-data">
      <For each={props.values}>
        {item => (
          <li>
            <div class="test-data-text">
              <span class="test-data-value">{item.value}</span>
              <span class="test-data-hint">
                {item.label}
                {item.hint && ` · ${item.hint}`}
              </span>
            </div>
            <CopyButton text={item.value} label={`Copy ${item.value}`} />
          </li>
        )}
      </For>
    </ul>
  )
}

const timeFormat = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

function EventList(props: { id: string; events: LoggedEvent[] }) {
  return (
    <div id={props.id} role="tabpanel" class="panel-body">
      <Show
        when={props.events.length}
        fallback={<p class="panel-empty">Interact with the demo to see element events here.</p>}
      >
        <ol class="event-list" aria-live="polite">
          <For each={props.events}>
            {event => (
              <li class="event">
                <time class="event-time" dateTime={event.at.toISOString()}>
                  {timeFormat.format(event.at)}
                </time>
                <span class="event-name">
                  <span class="event-source">{event.source}</span> {event.name}
                </span>
                <Show when={event.detail}>
                  <span class="event-detail">{event.detail}</span>
                </Show>
              </li>
            )}
          </For>
        </ol>
      </Show>
    </div>
  )
}
