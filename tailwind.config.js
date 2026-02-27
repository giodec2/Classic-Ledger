/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Classic Ledger custom colors
        ink: "#1A1A1A",
        ivory: "#F7F5F0",
        surface: "#FFFFFF",
        graphite: "#2C2C2C",
        "text-muted": "#949494",
        "accounting-red": "#C13D2F",
        guide: "#E5E0D6",
        "ink-black": "#0B0B0C",
        "text-secondary": "#6E6B66",
        "pale-red": "#FDECEA",
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        serif: ['Source Serif 4', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['clamp(44px, 5vw, 76px)', { lineHeight: '0.95', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display': ['clamp(36px, 4vw, 52px)', { lineHeight: '1.0', letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['clamp(15px, 1.15vw, 18px)', { lineHeight: '1.55' }],
        'data': ['14px', { lineHeight: '1.4', fontWeight: '400' }],
        'label': ['11px', { lineHeight: '1.2', letterSpacing: '0.08em', fontWeight: '500' }],
        'micro': ['10px', { lineHeight: '1.2', fontWeight: '400' }],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
        'paper': '2px',
      },
      boxShadow: {
        xs: "0 1px 0 rgba(0,0,0,0.04)",
        'paper': '0 2px 0 rgba(0,0,0,0.04)',
        'input': 'inset 0 1px 0 rgba(0,0,0,0.06)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "stamp": {
          "0%": { transform: "scale(1.6) rotate(-8deg)", opacity: "0" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "stamp": "stamp 0.3s ease-out forwards",
        "fade-in-up": "fade-in-up 0.45s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
