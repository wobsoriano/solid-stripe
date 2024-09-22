// @refresh reload
import { Suspense } from 'solid-js'
import { MetaProvider, Title } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import './app.css'
import Nav from './components/Nav'

export default function Root() {
  return (
    <Router
      root={props => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <Nav />
          <Suspense>
            <main>{props.children}</main>
          </Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}

// export default function Root() {
//   return (
//     <Html lang="en" data-theme="light">
//       <Head>
//         <Title>SolidStart - Bare</Title>
//         <Meta charset="utf-8" />
//         <Meta name="viewport" content="width=device-width, initial-scale=1" />
//       </Head>
//       <Body>
//           <Suspense fallback={<div>Loading...</div>}>
//             <ErrorBoundary>
//                 <Nav>
//                   <main>
//                     <Routes>
//                       <FileRoutes />
//                     </Routes>
//                   </main>
//                 </Nav>
//             </ErrorBoundary>
//           </Suspense>
//           <Scripts />
//       </Body>
//     </Html>
//   )
// }
