module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'eslint:recommended',
    'eslint-config-airbnb-base/legacy'
  ],
  rules: {
    strict: 0,
    'no-multi-assign': 0,
    'no-plusplus': 0,
    'vars-on-top': 0,
    'consistent-return': 0
  }
};
