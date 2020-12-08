var WebpackNotifierPlugin = require('..');

module.exports = {
    entry: "./entry.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    plugins: [
        new WebpackNotifierPlugin({
            editor: {
                command: 'C:\\Program Files\\JetBrains\\WebStorm 2019.2.4\\bin\\webstorm.bat',
                args: [
                  '--line', '${line}',
                  '--column', '${column}',
                  '${file}',
                ]
            }
        }),
    ]
};
