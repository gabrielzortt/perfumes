tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                serif: ['"Cormorant Garamond"', 'serif'],
                sans: ['"Inter"', 'sans-serif'],
            },
            colors: {
                cream: '#FAF6F2',
                sand: '#E8DDC9',
                line: '#E2D6C4',
                ink: '#2D2522',
                muted: '#7D746C',
                terracotta: { DEFAULT: '#C17C74', dark: '#A6635B' },
                blush: '#E8C5B8',
            },
            borderRadius: {
                sm: '0.125rem',
                DEFAULT: '0.25rem',
                md: '0.375rem',
            },
        }
    }
}
