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
    'consistent-return': 0
  }
};
