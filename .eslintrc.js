module.exports = {
    root: true,
    env: {
        'node': true
    },
    extends: [
        'eslint:recommended',
        'eslint-config-airbnb-base/legacy'
    ],
    rules: {
        strict: 0,
        indent: 0,
        'quotes': 0,
        'quote-props': 0,
        'comma-dangle': 0,
        'no-multi-assign': 0,
        'space-before-function-paren': 0,
        'no-plusplus': 0,
        'curly': 0,
        'nonblock-statement-body-position': 0,
        'padded-blocks': 0,
        'operator-linebreak': 0,
        'semi': 0,
        'object-curly-spacing': 0,
        'vars-on-top': 0,
        'consistent-return': 0,
    }
};
