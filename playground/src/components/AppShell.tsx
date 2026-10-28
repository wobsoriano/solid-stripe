import { A, useLocation } from '@solidjs/router'
import { createSignal, For, on, createEffect, type ParentProps } from 'solid-js'
import { examplesByGroup } from '~/examples'

export default function AppShell(props: ParentProps) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = createSignal(false)
  createEffect(
    on(
      () => location.pathname,
      () => setMenuOpen(false),
      { defer: true },
    ),
  )

  return (
    <div class="app">
      <header class="app-header">
        <A href="/" class="brand" end>
          solid-stripe <span class="brand-tag">playground</span>
        </A>
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
          aria-expanded={menuOpen()}
          aria-controls="example-nav"
          onClick={() => setMenuOpen(open => !open)}
        >
          {menuOpen() ? 'Close' : 'Examples'}
        </button>
      </header>
      <div class="app-body">
        <aside id="example-nav" class="app-sidebar" classList={{ 'is-open': menuOpen() }}>
          <nav aria-label="Examples">
            <A href="/" class="nav-link" activeClass="is-active" inactiveClass="" end>
              Overview
            </A>
            <For each={examplesByGroup}>
              {section => (
                <div class="nav-group">
                  <h2 class="nav-group-title">{section.group}</h2>
                  <For each={section.items}>
                    {example => (
                      <A
                        href={`/${example.slug}`}
                        class="nav-link"
                        activeClass="is-active"
                        inactiveClass=""
                        end
                      >
                        {example.title}
                      </A>
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
