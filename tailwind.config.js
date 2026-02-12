/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // BlueAlly Brand Colors
        blueally: {
          primary: '#0066CC',
          secondary: '#003D7A',
          accent: '#00A3E0',
          navy: '#1A2B4C',
          slate: '#32373C',
          light: '#E8F4FC',
          50: '#E8F4FC',
          100: '#C5E4F7',
          200: '#8CC8EF',
          300: '#52ACE6',
          400: '#1990DE',
          500: '#0066CC',
          600: '#0052A3',
          700: '#003D7A',
          800: '#002952',
          900: '#001429',
        },
        // Dark-first deep backgrounds
        deep: {
          900: '#0A0E1A',
          800: '#0F1629',
          700: '#111827',
          600: '#1A1F2E',
          500: '#1E2538',
          400: '#252D42',
        },
        // Glass surface colors
        glass: {
          light: 'rgba(255, 255, 255, 0.05)',
          medium: 'rgba(255, 255, 255, 0.08)',
          heavy: 'rgba(255, 255, 255, 0.12)',
          border: 'rgba(255, 255, 255, 0.10)',
          'border-light': 'rgba(255, 255, 255, 0.06)',
        },
        // Status
        success: {
          light: '#D1FAE5',
          DEFAULT: '#10B981',
          dark: '#047857',
        },
        warning: {
          light: '#FEF3C7',
          DEFAULT: '#F59E0B',
          dark: '#B45309',
        },
        danger: {
          light: '#FEE2E2',
          DEFAULT: '#EF4444',
          dark: '#B91C1C',
        },
        // Quadrant Colors
        quadrant: {
          champion: '#10B981',
          quickwin: '#3B82F6',
          strategic: '#F59E0B',
          foundation: '#6B7280',
        },
        // Track Colors
        track: {
          t1: '#10B981',
          t2: '#3B82F6',
          t3: '#8B5CF6',
        },
        // Cohort Colors
        cohort: {
          industrial: '#6366F1',
          services: '#EC4899',
          consumer: '#F97316',
          healthcare: '#14B8A6',
          logistics: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.05' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
      },
      fontWeight: {
        black: '900',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'elevated': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'glow-blue': '0 0 20px rgba(0, 102, 204, 0.3), 0 0 60px rgba(0, 102, 204, 0.1)',
        'glow-accent': '0 0 20px rgba(0, 163, 224, 0.3), 0 0 60px rgba(0, 163, 224, 0.1)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s ease infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'count-up': 'countUp 1.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 102, 204, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 102, 204, 0.4), 0 0 80px rgba(0, 163, 224, 0.15)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(135deg, #0066CC 0%, #003D7A 50%, #1A2B4C 100%)',
        'ambient-dark': 'radial-gradient(ellipse at 20% 50%, rgba(0, 102, 204, 0.12), transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0, 163, 224, 0.08), transparent 50%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      },
      backdropBlur: {
        '2xl': '40px',
        '3xl': '64px',
      },
    },
  },
  plugins: [],
}
