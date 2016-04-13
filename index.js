var stripANSI = require('strip-ansi');
var path = require('path');
var os = require('os');
var notifier = require('node-notifier');

var DEFAULT_LOGO = path.join(__dirname, 'logo.png');

function WebpackNotifierPlugin(options) {
  this.options = options || {};
  this.lastBuildSucceeded = false;
  this.isFirstBuild = true;
}
module.exports = WebpackNotifierPlugin;

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

WebpackNotifierPlugin.prototype.compileEndOptions = function (stats) {
  if (this.isFirstBuild) {
    this.isFirstBuild = false;

    if (this.options.skipFirstNotification) {
      return {};
    }
  }

  var imageFromOptions = ('contentImage' in this.options)
    ? this.options.contentImage
    : DEFAULT_LOGO;

  var successImage = '';
  var warningsImage = '';
  var errorsImage = '';
  if (typeof imageFromOptions === 'object') {
    successImage = imageFromOptions.success;
    warningsImage = imageFromOptions.warning;
    errorsImage = imageFromOptions.error;
  } else {
    successImage = imageFromOptions;
    warningsImage = imageFromOptions;
    errorsImage = imageFromOptions;
  }

  var hasEmoji = this.options.emoji;
  var error;
  var contentImage;
  var status;
  if (this.hasErrors(stats)) {
    error = findFirstDFS(stats.compilation, 'errors');
    contentImage = errorsImage;
    status = 'error';
  } else if (this.options.onlyOnError) {
    return {};
  } else if (this.hasWarnings(stats) && !this.options.excludeWarnings) {
    error = findFirstDFS(stats.compilation, 'warnings');
    contentImage = warningsImage;
    status = 'warning';
  } else if (!this.lastBuildSucceeded || this.options.alwaysNotify) {
    this.lastBuildSucceeded = true;
    return {
      message: (hasEmoji ? '✅ ' : '') + 'Build successful',
      contentImage: successImage,
      status: 'success'
    };
  } else {
    return {};
  }

  this.lastBuildSucceeded = false;

  var rawRequest, resource, line, column;

  if (error.module) {
    rawRequest = error.module.rawRequest;
    resource = error.module.resource;
  }

  var errorOrWarning = error.error || error.warning || error.message;
  if (errorOrWarning && errorOrWarning.loc) {
    line = errorOrWarning.loc.line;
    column = errorOrWarning.loc.column;
  }

  var message = (error.error ? (hasEmoji ? '❌ ' : '') + 'Error: ' : (error.warning || error.message) ? (hasEmoji ? '⚠️ ' : '') + 'Warning: ' : '')
               + (rawRequest ? rawRequest + '\n' : '')
               + (errorOrWarning ? errorOrWarning.toString() : '');

  return {
    message: stripANSI(message),
    contentImage: contentImage,
    status: status,
    location: {
      file: resource,
      line: line,
      column: column
    }
  };
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
  var { message, contentImage, status } = this.compileEndOptions(stats);
  if (message) {
    var title = this.options.title ? this.options.title : 'Webpack';
    if (typeof title === 'function') {
      title = title({
        msg: message, // compatibility with v1.11.0
        message: message,
        status: status
      });
    }

    var icon = (os.platform() === 'win32' || os.platform() === 'linux')
      ? contentImage
      : undefined;

    notifier.notify(Object.assign(
      {},
      this.options,
      {
        title,
        message,
        contentImage,
        icon
      }
    ));
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
