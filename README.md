# webpack-error-notification

[Webpack](http://webpack.github.io/) plugin that uses system notifications to
notify user about compilation error. Will also notify you about first successful
build after errors, but will not spam you about each good run.

Displays notification for the first run anyway, so you can fire up webpack
watcher and move on, and you will know when the first long compilation is done,
either good or bad.

## Installation

You can easily install this plugin to your project:

```
npm install --save-dev webpack-error-notification
```

On Linux you can have multiple notification tools, it seems the most popular is
`notify-send`. Check if it's installed, and if you don't have it, on Ubuntu
you can install it with `apt-get install libnotify-bin`.

For Mac OS (10.8+) you need to install
[terminal-notifier](https://github.com/alloy/terminal-notifier), the easy way is
to use [Homebrew](http://brew.sh/):

```
brew install terminal-notifier
```

For your preferred operating system you should have/install some command-line
tool that can display notification and read below.

## Usage

In config file:

``` javascript
var WebpackErrorNotificationPlugin = require('webpack-error-notification');

// ...
  module: {
    plugins: [
      new WebpackErrorNotificationPlugin(/* strategy */),
    ]
  },
// ...
```

You can supply some strategy for the plugin to display notification. If you
don't supply anything, it will use `process.platform` as a strategy
name. `'darwin'` and `'linux'` are supported out of the box now.

You can also supply `function(msg) {}` as a strategy that will use your
notification CLI tool of choice.

Main idea here is that, preferrably, people on your team shouldn't have to
customize webpack config to be able to see notifications.
