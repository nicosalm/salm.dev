import type { Config } from 'tailwindcss';
import { typography } from './src/styles/typography';

export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: typography.fontFamily,
            fontSize: typography.fontSize,
            typography: (theme: any) => ({
                DEFAULT: {
                    css: {
                        'font-family': typography.fontFamily.serif.join(', '),
                        'max-width': 'none',
                        '--tw-prose-body': 'rgb(17 24 39)',                 // text-gray-900
                        '--tw-prose-headings': 'rgb(17 24 39)',
                        '--tw-prose-invert-body': 'rgb(243 244 246)',       // text-gray-100
                        '--tw-prose-invert-headings': 'rgb(243 244 246)',
                        'pre': {
                            backgroundColor: theme('colors.gray.900'),
                            color: theme('colors.gray.100'),
                            borderRadius: theme('borderRadius.lg'),
                            padding: theme('spacing.4'),
                            border: '1px solid',
                            borderColor: theme('colors.gray.800'),
                        },
                        'code': {
                            color: theme('colors.pink.500'),
                            '&::before': {
                                content: '""',
                            },
                            '&::after': {
                                content: '""',
                            },
                        },
                        'code::before': {
                            content: '""',
                        },
                        'code::after': {
                            content: '""',
                        }
                    },
                },
            }),
        },
    },
    plugins: [require('@tailwindcss/typography')],
} satisfies Config;
