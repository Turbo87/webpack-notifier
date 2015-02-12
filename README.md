# webpack-notifier

This is a [webpack](http://webpack.github.io/) plugin that uses the
[node-notifier](https://github.com/mikaelbr/node-notifier) package to
display build status system notifications to the user.

> This is a fork of the 
[webpack-error-notification](https://github.com/vsolovyov/webpack-error-notification)
plugin. It supports Windows and there is no need to manually install
the `terminal-notifier` package.

The plugin will notify you about the first run (success/fail),
all failed runs and the first successful run after recovering from
a build failure. In other words: it will not by annoying if everything
is fine with your build.


## Installation

Use `npm` to install this package:

    npm install --save-dev webpack-error-notification

Check the `node-notifier`
[Requirements](https://github.com/mikaelbr/node-notifier#requirements)
whether you need to install any additional tools for your OS.


## Usage

In config file:

```js
var WebpackNotifierPlugin = require('webpack-notifier');

// ...

module: {
  plugins: [
    new WebpackNotifierPlugin(),
  ]
},

// ...
```
