/** @type {import('tailwindcss').Config} */
// NOTE: This project uses Tailwind CSS v4. Custom colors are defined via
// @theme in app/globals.css (the v4 canonical approach). This file
// is kept as a reference for the design system palette.
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue':  '#0F2540',
        'accent-green':  '#72D611',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg:  '0.5rem',
        xl:  '0.75rem',
        '2xl': '1rem',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
}
