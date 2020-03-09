module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off', // In favor of inferred return types
    '@typescript-eslint/no-explicit-any': 'off', // Some anys simply can't be avoided here
    '@typescript-eslint/no-use-before-define': 'error', // This instead of ...
    'no-undef': 'off', // ...this
    'no-shadow': 'error', // Most important ESLint rule of all times
  },
}
