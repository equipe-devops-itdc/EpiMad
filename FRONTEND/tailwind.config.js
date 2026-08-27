import { Warning } from 'postcss';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#10B981',


        Warning: '#facc15',
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