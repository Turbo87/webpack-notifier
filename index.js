var stripANSI = require('strip-ansi');
var path = require('path');
var objectAssign = require('object-assign');
var os = require('os');
var notifier = require('node-notifier');

var DEFAULT_LOGO = path.join(__dirname, 'logo.png');

function WebpackNotifierPlugin(options) {
  this.options = options || {};
  this.lastBuildSucceeded = false;
  this.isFirstBuild = true;
}
module.exports = WebpackNotifierPlugin;

WebpackNotifierPlugin.prototype.compileMessage = function (stats) {
  function findFirstDFS(compilation, key) {
    var match = compilation[key][0];
    if (match) {
      return match;
    }

    var children = compilation.children;
    for (var i = 0; i < children.length; i += 1) {
      match = findFirstDFS(children[i], key);
      if (match) {
        return match;
      }
    }
  }

  if (this.isFirstBuild) {
    this.isFirstBuild = false;

    if (this.options.skipFirstNotification) {
      return;
    }
  }

  var hasEmoji = this.options.emoji;
  var error;
  if (this.hasErrors(stats)) {
    error = findFirstDFS(stats.compilation, 'errors');
  } else if (this.options.onlyOnError) {
    return;
  } else if (this.hasWarnings(stats) && !this.options.excludeWarnings) {
    error = findFirstDFS(stats.compilation, 'warnings');
  } else if (!this.lastBuildSucceeded || this.options.alwaysNotify) {
    this.lastBuildSucceeded = true;
    return (hasEmoji ? '✅ ' : '') + 'Build successful';
  } else {
    return;
  }

  this.lastBuildSucceeded = false;

  var message = '';
  if (error.module && error.module.rawRequest) {
    message = error.module.rawRequest + '\n';
  }

  if (error.error) {
    message = (hasEmoji ? '❌ ' : '') + 'Error: ' + message + error.error.toString();
  } else if (error.warning) {
    message = (hasEmoji ? '⚠️ ' : '') + 'Warning: ' + message + error.warning.toString();
  } else if (error.message) {
    message = (hasEmoji ? '⚠️ ' : '') + 'Warning: ' + message + error.message.toString();
  }

  return stripANSI(message);
};

WebpackNotifierPlugin.prototype.hasErrors = function (stats) {
  return stats.hasErrors()
      || stats.compilation.children.some(child => child.getStats().hasErrors());
};

WebpackNotifierPlugin.prototype.hasWarnings = function (stats) {
  return stats.hasWarnings()
      || stats.compilation.children.some(child => child.getStats().hasWarnings());
};

WebpackNotifierPlugin.prototype.compilationDone = function (stats) {
  var msg = this.compileMessage(stats);
  if (msg) {
    var contentImage = ('contentImage' in this.options)
      ? this.options.contentImage : DEFAULT_LOGO;

    var title = this.options.title;
    if (typeof title === 'function') {
      title = title({ msg: msg });
    }

    notifier.notify(objectAssign({
      title: 'Webpack',
      message: msg,
      contentImage: contentImage,
      icon: (os.platform() === 'win32' || os.platform() === 'linux') ? contentImage : undefined
    }, this.options, { title: title }));
  }
};

WebpackNotifierPlugin.prototype.apply = function (compiler) {
  if (compiler.hooks) {
    var plugin = { name: 'Notifier' };

    compiler.hooks.done.tap(plugin, this.compilationDone.bind(this));
  } else {
    compiler.plugin('done', this.compilationDone.bind(this));
  }
};
