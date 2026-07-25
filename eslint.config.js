import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    // Fichiers de config chargés par Node (ESM, cf. "type": "module").
    files: ['tailwind.config.js', 'postcss.config.js'],
    languageOptions: {
      globals: globals.node,
      sourceType: 'module',
      ecmaVersion: 'latest',
    },
    rules: { ...js.configs.recommended.rules },
  },
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['tailwind.config.js', 'postcss.config.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      // Apporte `jsx-uses-vars` : sans lui, `motion` utilisé uniquement via
      // <motion.div /> était signalé à tort comme variable inutilisée.
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['**/*.test.{js,jsx}', 'vitest.setup.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
]
