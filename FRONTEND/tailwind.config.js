/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ✅ AJOUT DES POLICES
      fontFamily: {
        // Police principale (Interface, tableaux, chiffres)
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        // Police pour les codes techniques (CIM-10, identifiants)
        mono: ['"IBM Plex Mono"', '"Roboto Mono"', 'monospace'],
      },
      // Tes couleurs personnalisées
      colors: {
        primary: '#2563EB',
        secondary: '#10B981',
        warning: '#facc15', // Minuscule pour respecter la convention Tailwind
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