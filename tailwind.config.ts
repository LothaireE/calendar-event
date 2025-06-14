import type { Config } from 'tailwindcss'
// import { fontFamily } from 'tailwindcss/defaultTheme'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,html}',
    ],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            fontFamily: {
                sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
            },
        },
    },
    plugins: [],
}

export default config