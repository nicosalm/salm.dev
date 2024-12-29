/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        'iosevka': ['var(--font-iosevka)'],
        'ibm-flexi': ['var(--font-ibm-flexi)'],
        'ibm-vga': ['var(--font-ibm-vga)'],
        'bigblue': ['var(--font-bigblue)'],
      },
    },
  },
  plugins: [
        require('@tailwindcss/typography'),
    ],
}
