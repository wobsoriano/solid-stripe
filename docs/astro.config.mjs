import { defineConfig } from 'astro/config'
import solid from '@astrojs/solid-js'
import starlight from '@astrojs/starlight'

// https://astro.build/config
export default defineConfig({
  integrations: [
    solid(),
    starlight({
      title: 'Solid Stripe',
      customCss: [
        // Relative path to your custom CSS file
        './src/styles/custom.css',
      ],
      social: {
        github: 'https://github.com/wobsoriano/solid-stripe',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Installation', link: '/getting-started/installation' },
            { label: 'Quickstart', link: '/getting-started/quickstart' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Payment Element', link: '/guides/payment-element/' },
            { label: 'Link Authentication', link: '/guides/link-authentication/' },
            { label: 'Credit Cards', link: '/guides/credit-cards/' },
            { label: 'GooglePay & ApplePay', link: '/guides/payment-request-button/' },
            { label: 'SEPA', link: '/guides/sepa/' },
            { label: 'iDEAL', link: '/guides/ideal/' },
            { label: 'Elements provider', link: '/guides/elements-provider' },
            { label: 'Element components', link: '/guides/element-components' },
          ],
        },
        {
          label: 'Primitives',
          items: [
            { label: 'useStripe', link: '/primitives/use-stripe' },
            { label: 'useElements', link: '/primitives/use-elements' },
            { label: 'useStripeProxy', link: '/primitives/use-stripe-proxy' },
          ],
        },
      ],
    }),
  ],

  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
})
