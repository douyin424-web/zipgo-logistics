/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zipgo: {
          navy: '#06152B', // Main Dark Navy Blue (Header, Ribbon, Footer)
          'navy-dark': '#030C19', // Deepest Navy
          'navy-card': '#0B1E38',
          blue: '#1D4ED8', // Primary Royal Blue
          'blue-light': '#2563EB',
          'blue-accent': '#3B82F6',
          green: '#10B981', // EV Green accent badge
          bg: '#FFFFFF', // Clean White Page Background
          'bg-light': '#F8FAFC', // Soft Light Background
          card: '#FFFFFF', // White Card Background
          border: '#E2E8F0', // Soft Border
          text: '#0F172A', // Main Text
          muted: '#64748B', // Secondary Text
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
