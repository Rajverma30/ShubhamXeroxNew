/** Shares the storefront's tokens so both apps look like one product. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f6f7f9', 100: '#eceef2', 200: '#d5d9e2', 300: '#b0b8c9',
          400: '#8591ab', 500: '#657391', 600: '#505c78', 700: '#424b61',
          800: '#3a4152', 900: '#0f1729', 950: '#080d18',
        },
        brand: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
        },
      },
      fontFamily: {
        // One sans-serif family throughout — no serif, no italics anywhere.
        // `display` is kept as a name so heading classes keep working, but it
        // resolves to the same family as body text.
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      // Type scale.
      //
      // Every step is multiplied by `--font-scale` (declared in
      // styles/index.css), so you can resize *all* text on the site from one
      // line of CSS without touching layout — spacing stays on Tailwind's
      // normal rem scale, so nothing reflows unexpectedly.
      //
      //   :root { --font-scale: 1;    }  original
      //   :root { --font-scale: 1.06; }  current default — slightly larger
      //   :root { --font-scale: 0.95; }  more compact
      fontSize: {
        '2xs': ['calc(0.6875rem * var(--font-scale))', { lineHeight: 'calc(1rem * var(--font-scale))' }],
        xs: ['calc(0.75rem * var(--font-scale))', { lineHeight: 'calc(1.05rem * var(--font-scale))' }],
        sm: ['calc(0.875rem * var(--font-scale))', { lineHeight: 'calc(1.3rem * var(--font-scale))' }],
        base: ['calc(1rem * var(--font-scale))', { lineHeight: 'calc(1.55rem * var(--font-scale))' }],
        lg: ['calc(1.125rem * var(--font-scale))', { lineHeight: 'calc(1.7rem * var(--font-scale))' }],
        xl: ['calc(1.25rem * var(--font-scale))', { lineHeight: 'calc(1.8rem * var(--font-scale))' }],
        '2xl': ['calc(1.5rem * var(--font-scale))', { lineHeight: 'calc(2rem * var(--font-scale))' }],
        '3xl': ['calc(1.875rem * var(--font-scale))', { lineHeight: 'calc(2.3rem * var(--font-scale))' }],
        '4xl': ['calc(2.25rem * var(--font-scale))', { lineHeight: 'calc(2.6rem * var(--font-scale))' }],
        '5xl': ['calc(3rem * var(--font-scale))', { lineHeight: '1.05' }],
        '6xl': ['calc(3.75rem * var(--font-scale))', { lineHeight: '1.02' }],
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,41,.04), 0 8px 24px -12px rgba(15,23,41,.12)',
        lift: '0 2px 4px rgba(15,23,41,.04), 0 18px 40px -16px rgba(15,23,41,.22)',
      },
      transitionTimingFunction: { premium: 'cubic-bezier(.22,1,.36,1)' },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'none' } },
      },
      animation: { shimmer: 'shimmer 1.6s infinite', 'fade-up': 'fade-up .4s cubic-bezier(.22,1,.36,1) both' },
    },
  },
  plugins: [],
};
