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
          dark: '#2B2116',
        },
        primary: {
          50: '#FEF9E8',
          100: '#FDF3D1',
          200: '#FAE29B',
          300: '#F7D165',
          400: '#F5C94C',
          500: '#F2C94C',
          600: '#DAB544',
          700: '#B69639',
          800: '#93782E',
          900: '#705C23',
        },
      },
      borderRadius: {
        lg: '16px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.08)',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
}