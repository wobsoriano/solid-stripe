// @refresh reload
import { Suspense } from 'solid-js'
import {
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from 'solid-start'
import './root.css'

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>SolidStart - Bare</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
          <Suspense>
            <ErrorBoundary>
              <div class="container">
                <A href="/">Index</A>
                <A href="/payment-element">Payment Element</A>
                <A href="/credit-card">Credit Card</A>
                <main>
                  <Routes>
                    <FileRoutes />
                  </Routes>
                </main>
              </div>
            </ErrorBoundary>
          </Suspense>
          <Scripts />
      </Body>
    </Html>
  )
}
