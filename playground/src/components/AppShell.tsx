import { useLocation } from '@solidjs/router'
import { createEffect, createSignal, For, type ParentProps } from 'solid-js'
import { examplesByGroup } from '~/examples'

export default function AppShell(props: ParentProps) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = createSignal(false)
  createEffect(
    () => location.pathname,
    () => {
      setMenuOpen(false)
    },
    { defer: true },
  )

  return (
    <div class="app">
      <header class="app-header">
        <a href="/" class="brand">
          solid-stripe <span class="brand-tag">playground</span>
        </a>
        <nav class="header-links" aria-label="Project links">
          <a href="https://github.com/wobsoriano/solid-stripe" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://www.npmjs.com/package/solid-stripe" target="_blank" rel="noreferrer">
            npm
          </a>
        </nav>
        <button
          type="button"
          class="menu-button"
          aria-expanded={menuOpen() ? 'true' : 'false'}
          aria-controls="example-nav"
          onClick={() => setMenuOpen(open => !open)}
        >
          {menuOpen() ? 'Close' : 'Examples'}
        </button>
      </header>
      <div class="app-body">
        <aside id="example-nav" class={['app-sidebar', { 'is-open': menuOpen() }]}>
          <nav aria-label="Examples">
            <a href="/" class="nav-link">
              Overview
            </a>
            <For each={examplesByGroup}>
              {section => (
                <div class="nav-group">
                  <h2 class="nav-group-title">{section.group}</h2>
                  <For each={section.items}>
                    {example => (
                      <a href={`/${example.slug}`} class="nav-link">
                        {example.title}
                      </a>
                    )}
                  </For>
                </div>
              )}
            </For>
          </nav>
        </aside>
        <main class="app-main">{props.children}</main>
      </div>
    </div>
  )
}
