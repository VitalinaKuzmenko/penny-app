module.exports = {
  extends: [
    '../../.eslintrc.base.js',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react', '@typescript-eslint'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',

    // Allow `any` in this package
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
