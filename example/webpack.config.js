var WebpackNotifierPlugin = require('..');

module.exports = {
    entry: "./entry.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    plugins: [
        new WebpackNotifierPlugin(),
    ]
};
