/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"Roboto Mono"', 'monospace'],
      },
      
      colors: {
        primary: '#2563EB',
        secondary: '#10B981',
        warning: '#facc15',
        accent: '#f97316',
        danger: '#dc2626',
        success: '#22c55e',
        background: '#f8fafc',
        card: '#ffffff',
        border: '#e5e7eb',
        'text-primary' : '#1f2937',
        'text-secondary' : '#6b7280',
      },
    },
  },
  plugins: [],
}