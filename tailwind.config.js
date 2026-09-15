/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0284c7',
          dark: '#0369a1',
          light: '#e0f2fe',
        },
        secondary: {
          DEFAULT: '#10b981',
          dark: '#059669',
          light: '#d1fae5',
        },
        danger: {
          DEFAULT: '#ef4444',
          light: '#fee2e2',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fef3c7',
        },
        gold: {
          DEFAULT: '#eab308',
          light: '#fef08a',
        },
        accentWheel: '#8b5cf6',
        bgPage: '#f8fafc',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        handwriting: ['"Dancing Script"', 'cursive'],
      },
      borderRadius: {
        'card': '16px',
        'subtle': '10px',
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'soft-md': '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
        'soft-lg': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
