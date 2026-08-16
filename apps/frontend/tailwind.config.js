/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // CloudLab-AI dark navy / slate premium palette.
        // Colors are used primarily for status/actions/alerts —
        // not decoration.
        surface: {
          base: '#0b0f19',
          raised: '#111827',
          overlay: '#1a2233'
        },
        border: {
          subtle: '#1f2937',
          strong: '#334155'
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#64748b'
        },
        brand: {
          DEFAULT: '#6366f1',
          hover: '#818cf8'
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#06b6d4'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      transitionDuration: {
        micro: '150ms',
        normal: '250ms',
        large: '500ms'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        }
      },
      animation: {
        shimmer: 'shimmer 2.2s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
