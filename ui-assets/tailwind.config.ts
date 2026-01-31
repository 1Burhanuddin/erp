import tailwindcssLogical from 'tailwindcss-logical'
import type { Config } from 'tailwindcss'

import tailwindPlugin from './src/libs/tailwindPlugin'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,css}'],
  corePlugins: {
    preflight: false
  },
  important: '.__next',
  plugins: [tailwindcssLogical, tailwindPlugin],
  theme: {
    extend: {}
  }
}

export default config
