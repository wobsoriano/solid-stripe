import { Title } from '@solidjs/meta'
import { Loading } from 'solid-js'
import AppShell from './components/AppShell'
import { Router } from './router'
import './app.css'

export default function App() {
  return (
    <Router>
      {props => (
        <>
          <Title>solid-stripe playground</Title>
          <AppShell>
            <Loading>{props.children}</Loading>
          </AppShell>
        </>
      )}
    </Router>
  )
}
