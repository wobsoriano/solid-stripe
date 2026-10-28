import type { Appearance, StripeElementStyle } from '@stripe/stripe-js'
import { createSignal, onCleanup, onMount, type Accessor } from 'solid-js'

export type ColorScheme = 'light' | 'dark'
export type StripeTheme = 'stripe' | 'night' | 'flat'

// Literal copies of the app.css tokens, because Stripe iframes cannot read CSS variables.
const fontFamily =
  "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
const palette = {
  light: {
    accent: '#4f46e5',
    surface: '#ffffff',
    text: '#18181b',
    subtle: '#71717a',
    danger: '#b91c1c',
  },
  dark: {
    accent: '#818cf8',
    surface: '#18181b',
    text: '#fafafa',
    subtle: '#71717a',
    danger: '#f87171',
  },
}

export function useColorScheme(): Accessor<ColorScheme> {
  const [scheme, setScheme] = createSignal<ColorScheme>('light')
  onMount(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setScheme(query.matches ? 'dark' : 'light')
    update()
    query.addEventListener('change', update)
    onCleanup(() => query.removeEventListener('change', update))
  })
  return scheme
}

export const defaultTheme = (scheme: ColorScheme): StripeTheme =>
  scheme === 'dark' ? 'night' : 'stripe'

export function appearance(theme: StripeTheme): Appearance {
  const colors = palette[theme === 'night' ? 'dark' : 'light']
  return {
    theme,
    variables: {
      colorPrimary: colors.accent,
      borderRadius: '6px',
      fontFamily,
      ...(theme === 'night' && { colorBackground: colors.surface, colorText: colors.text }),
    },
  }
}

/** Style for the legacy split-field elements, which take `style` instead of `appearance`. */
export function legacyElementStyle(scheme: ColorScheme): StripeElementStyle {
  const colors = palette[scheme]
  return {
    base: {
      color: colors.text,
      fontFamily,
      fontSize: '15px',
      iconColor: colors.subtle,
      '::placeholder': { color: colors.subtle },
    },
    invalid: { color: colors.danger, iconColor: colors.danger },
  }
}
