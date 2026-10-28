import { createContext, createSignal, useContext } from 'solid-js'

export interface LoggedEvent {
  id: number
  at: Date
  source: string
  name: string
  detail: string
}

const MAX_EVENTS = 50

export function createEventLog() {
  const [events, setEvents] = createSignal<LoggedEvent[]>([])
  let nextId = 0
  const add = (source: string, name: string, detail: string) =>
    setEvents(list =>
      [{ id: nextId++, at: new Date(), source, name, detail }, ...list].slice(0, MAX_EVENTS),
    )
  return { events, add, clear: () => setEvents([]) }
}

export type EventLog = ReturnType<typeof createEventLog>

export const EventLogContext = createContext<EventLog>()

/** Returns `log(source, name)`, which makes a handler that records a summary of what it receives. */
export function useEventLog() {
  const eventLog = useContext(EventLogContext)
  if (!eventLog) throw new Error('useEventLog must be called inside <ExampleLayout>')
  return (source: string, name: string) => (event?: unknown) =>
    eventLog.add(source, name, summarizeEvent(event))
}

export function summarizeEvent(event: unknown): string {
  if (event == null) return ''
  if (typeof event !== 'object') return String(event)
  const e = event as Record<string, any>
  // onReady hands over the Element instance itself, which has nothing worth printing.
  if (typeof e.mount === 'function') return 'mounted'

  const parts: string[] = []
  if ('availablePaymentMethods' in e) {
    const available = Object.entries(e.availablePaymentMethods ?? {})
      .filter(([, enabled]) => enabled)
      .map(([method]) => method)
    parts.push(available.length ? `available: ${available.join(', ')}` : 'no wallets available')
  }
  if (typeof e.expressPaymentType === 'string') parts.push(e.expressPaymentType)
  if (typeof e.value?.type === 'string') parts.push(e.value.type)
  if (typeof e.value?.email === 'string' && e.value.email) parts.push(e.value.email)
  if (typeof e.brand === 'string' && e.brand !== 'unknown') parts.push(e.brand)
  if (typeof e.bankName === 'string') parts.push(e.bankName)
  if (typeof e.complete === 'boolean') {
    parts.push(e.complete ? 'complete' : e.empty ? 'empty' : 'incomplete')
  }
  if (typeof e.paymentIntent?.status === 'string') {
    parts.push(`${e.paymentIntent.id} ${e.paymentIntent.status}`)
  }
  if (typeof e.error?.message === 'string') parts.push(e.error.message)
  return parts.join(' · ')
}
