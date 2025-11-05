/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      height: {
        svh: '100svh',
        dvh: '100dvh',
        lvh: '100lvh',
      },
      width: {
        svw: '100svw',
        dvw: '100dvw',
        lvw: '100lvw',
      },
    },
  },
};
