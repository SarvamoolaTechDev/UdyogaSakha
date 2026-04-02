import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { teal: '#1D9E75', blue: '#185FA5', coral: '#993C1D' },
      },
    },
  },
  plugins: [],
};

export default config;
