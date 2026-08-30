/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        expense: {
          'food-dining': '#f97316',
          transportation: '#3b82f6',
          shopping: '#ec4899',
          housing: '#8b5cf6',
          utilities: '#f59e0b',
          entertainment: '#ef4444',
          healthcare: '#10b981',
          education: '#06b6d4',
          insurance: '#6366f1',
          personal: '#8b5cf6',
          debt: '#dc2626',
          savings: '#16a34a',
          gifts: '#f43f5e',
          travel: '#0ea5e9',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}