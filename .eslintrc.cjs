module.exports = {
  root: true,
  env: { browser: true, es2024: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:react/recommended', // Only when using React
    'plugin:react-hooks/recommended', // Only when using React
    'plugin:react/jsx-runtime', // Only when using React
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-refresh', 'prettier'],
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'spaced-comment': [
      'error',
      'always',
      {
        exceptions: ['-', '+'],
        markers: ['!', 'TODO', '?', '//'],
      },
    ],
    'capitalized-comments': [
      'error',
      'always',
      {
        ignorePattern: 'pragma|ignored',
        ignoreInlineComments: true,
        ignoreConsecutiveComments: true,
      },
    ],
    curly: ['error', 'all'],
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }], // Only when using React
  },
};
