import { Title } from '@solidjs/meta'
import type { RouteDefinition } from '@solidjs/router'
import { httpStatus } from '@solidjs/web'

export const route = {
  preload: () => httpStatus(404),
} satisfies RouteDefinition

export default function NotFound() {
  return (
    <div class="page-header">
      <Title>Not found · solid-stripe</Title>
      <p class="eyebrow">404</p>
      <h1 class="page-title">Page not found</h1>
      <p class="page-summary">
        This page does not exist. <a href="/">Browse the examples</a>.
      </p>
    </div>
  )
}
