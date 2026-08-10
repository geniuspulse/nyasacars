import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*'
  ],
  theme: {
    extend: {
      colors: {
        nyasa: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#006A6A', // Base teal (#006A6A)
          700: '#005858',
          800: '#004747',
          900: '#003636',
          950: '#001a1a',
        },
        primary: colors.indigo,
      },
    },
  },
  plugins: [],
};

export default config;
