/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FFFFFF',
          dark: '#152018'
        },
        ink: {
          DEFAULT: '#1B2420',
          dark: '#E7EFE9'
        },
        teal: {
          50: '#EAF5EC',
          100: '#CFE8D4',
          300: '#74B583',
          500: '#2E7D32',
          600: '#256829',
          700: '#1B4E1F',
          900: '#0F2E12'
        },
        rust: {
          50: '#FDEDEE',
          300: '#E58A8F',
          500: '#C8323A',
          600: '#A4262D',
          700: '#7C1B21'
        },
        moss: {
          50: '#EAF6EE',
          300: '#7FC79A',
          500: '#1F8A4C',
          600: '#176B3B'
        },
        sand: {
          DEFAULT: '#8B8265',
          light: '#E9E2C7'
        },
        // Sparing accent only - never used for buttons/backgrounds, just
        // small highlights (e.g. a badge or icon), so it never competes
        // visually with the Pending-status badge color.
        gold: {
          DEFAULT: '#F9A825',
          dark: '#C77800'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      boxShadow: {
        thread: 'inset 2px 0 0 0 rgba(15,61,62,0.15)'
      },
      borderRadius: {
        DEFAULT: '6px'
      }
    }
  },
  plugins: []
};
