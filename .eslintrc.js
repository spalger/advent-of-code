module.exports = {
  env: {
    node: true,
    es2020: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'prettier',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['prettier', '@typescript-eslint'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-extra-semi': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'linebreak-style': ['error', 'unix'],
  },
}
