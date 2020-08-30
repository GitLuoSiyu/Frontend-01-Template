module.exports = {
    env: {
      browser: true,
      es2020: true,
    },
    extends: ['airbnb-base', 'plugin:react/recommended'],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 12,
      sourceType: 'module',
    },
    rules: {
      semi: 'error',
      'no-unused-vars': 'error',
      'linebreak-style': ['error', 'unix'],
    },
    plugins: ['react'],
  };