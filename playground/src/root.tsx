// @refresh reload
import { Suspense } from 'solid-js'
import {
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
import Nav from './components/Nav'

export default function Root() {
  return (
    <Html lang="en" data-theme="light">
      <Head>
        <Title>SolidStart - Bare</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
          <Suspense fallback={<div>Loading...</div>}>
            <ErrorBoundary>
                <Nav>
                  <main>
                    <Routes>
                      <FileRoutes />
                    </Routes>
                  </main>
                </Nav>
            </ErrorBoundary>
          </Suspense>
          <Scripts />
      </Body>
    </Html>
  )
}
