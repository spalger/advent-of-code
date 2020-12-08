module.exports = {
  env: {
    node: true,
    es2020: true,
  },
  parser: '@babel/eslint-parser',
  extends: ['prettier', 'eslint:recommended'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'no-constant-condition': 'off',
  },
}
