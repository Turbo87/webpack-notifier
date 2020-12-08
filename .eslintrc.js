module.exports = {
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module'
  },
  root: true,
  env: {
    node: true
  },
  extends: [
    'eslint:recommended',
    'eslint-config-airbnb-base/legacy'
  ],
  rules: {
    'vars-on-top': 0,
    'consistent-return': 0,
    'no-nested-ternary': 0,
    'one-var': 0,
    'one-var-declaration-per-line': 0,
    'object-curly-newline': 0
  }
};
