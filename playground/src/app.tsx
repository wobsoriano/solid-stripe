// @refresh reload
import { MetaProvider, Title } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import AppShell from './components/AppShell'
import './app.css'

export default function Root() {
  return (
    <Router
      root={props => (
        <MetaProvider>
          <Title>solid-stripe playground</Title>
          <AppShell>
            <Suspense>{props.children}</Suspense>
          </AppShell>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
