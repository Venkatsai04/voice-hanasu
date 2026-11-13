/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E11D48',
          redDark: '#BE123C',
          redDeep: '#9F1239',
          redLight: '#FFE4E6',
          redSurface: '#FFF1F2',
          redMuted: 'rgba(225, 29, 72, 0.08)',
          white: '#FFFFFF',
          canvas: '#F4F5F7',
          card: '#FFFFFF',
          surface: '#FAFAFA',
          border: '#E4E4E7',
          borderLight: '#F4F4F5',
          black: '#09090B',
          dark: '#18181B',
          textPrimary: '#09090B',
          textSecondary: '#52525B',
          textMuted: '#71717A',
          // Compatibility fallbacks mapped cleanly to red & black
          sky: '#E11D48',
          skyDark: '#BE123C',
          skyDeep: '#9F1239',
          skyAccent: '#F43F5E',
          skyLight: '#FFE4E6',
          skySurface: '#FFF1F2',
          skyMuted: 'rgba(225, 29, 72, 0.08)',
          muted: '#71717A',
          subtext: '#52525B'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'soft-card': '0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'soft-float': '0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'red-glow': '0 0 24px -2px rgba(225, 29, 72, 0.3)',
        'black-glow': '0 4px 16px -2px rgba(9, 9, 11, 0.25)'
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
