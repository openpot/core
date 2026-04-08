import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import nextVitals from 'eslint-config-next/core-web-vitals.js';
import jsxA11y from 'eslint-plugin-jsx-a11y';

const compat = new FlatCompat({
  baseDirectory: path.dirname(fileURLToPath(import.meta.url)),
});
const jsxA11yRules = jsxA11y.configs.recommended.rules;

const config = [
  ...compat.config(nextVitals),
  {
    ignores: [
      '.next/**',
      'coverage/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...jsxA11yRules,
    },
  },
];

export default config;
