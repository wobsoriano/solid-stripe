import { Title } from '@solidjs/meta'
import { For } from 'solid-js'
import CopyButton from '~/components/CopyButton'
import { examplesByGroup } from '~/examples'

const installCommand = 'npm install @stripe/stripe-js solid-stripe'

export default function Home() {
  return (
    <>
      <Title>solid-stripe playground</Title>
      <section class="hero">
        <p class="eyebrow">solid-stripe</p>
        <h1 class="hero-title">Stripe Elements for SolidJS</h1>
        <p class="hero-lead">
          Solid components for Stripe.js and Stripe Elements. Every example runs in Stripe test
          mode, logs element events as they fire, and shows its own source so you can copy it.
        </p>
        <div class="install">
          <code>{installCommand}</code>
          <CopyButton text={installCommand} label="Copy install command" />
        </div>
      </section>
      <For each={examplesByGroup}>
        {section => (
          <section class="section">
            <h2 class="section-title">{section.group}</h2>
            <div class="card-grid">
              <For each={section.items}>
                {example => (
                  <a href={`/${example.slug}`} class="card example-card">
                    <h3>{example.title}</h3>
                    <p>{example.summary}</p>
                    <ul class="chips" aria-label="Components used">
                      <For each={example.components}>{name => <li class="chip">{name}</li>}</For>
                    </ul>
                  </a>
                )}
              </For>
            </div>
          </section>
        )}
      </For>
    </>
  )
}
