import { Title } from '@solidjs/meta'
import { A } from '@solidjs/router'
import { HttpStatusCode } from '@solidjs/start'

export default function NotFound() {
  return (
    <div class="page-header">
      <Title>Not found · solid-stripe</Title>
      <HttpStatusCode code={404} />
      <p class="eyebrow">404</p>
      <h1 class="page-title">Page not found</h1>
      <p class="page-summary">
        This page does not exist. <A href="/">Browse the examples</A>.
      </p>
    </div>
  )
}
