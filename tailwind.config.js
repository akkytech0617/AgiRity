/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand Colors from Design Guide
        primary: {
          DEFAULT: '#4A90E2',
          50: '#EBF3FC',
          100: '#D7E7F9',
          200: '#AFCFF3',
          300: '#87B7ED',
          400: '#5FA3E8',
          500: '#4A90E2',
          600: '#2171C9',
          700: '#19569A',
          800: '#113B6A',
          900: '#09203B',
        },
        accent: {
          blue: '#0066FF',
          orange: '#FF6B35',
        },
        // Light Mode
        surface: '#F8F9FA',
        border: '#E5E7EB',
        'text-primary': '#1F2937',
        'text-secondary': '#6B7280',
        // Status Colors
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        display: ['Raleway', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        button: '8px',
      },
      spacing: {
        // 8px base spacing system
        1: '8px',
        2: '16px',
        3: '24px',
        4: '32px',
        5: '40px',
        6: '48px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
};
